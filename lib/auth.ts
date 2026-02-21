import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { validateTOTP, validateBackupCode, parseBackupCodes } from "./totp";
import { checkRateLimit } from "./rateLimit";

// Extend NextAuth types to include role and onboarding flag
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "BUYER" | "SELLER" | "ADMIN";
      needsOnboarding?: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "BUYER" | "SELLER" | "ADMIN";
    needsOnboarding?: boolean;
  }
}

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "TOTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password_hash: true,
            totp_enabled: true,
            totp_secret: true,
            backup_codes: true,
          },
        });

        if (!user || !user.password_hash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        // 2FA check
        if (user.totp_enabled && user.totp_secret) {
          const totpCode = (credentials.totp as string | undefined)?.trim();
          if (!totpCode) {
            // No TOTP provided but required — frontend handles via login-check
            return null;
          }

          // Rate limit 2FA verification attempts per user to prevent brute-force
          const rateLimitResult = checkRateLimit(user.id, "auth:2fa-login");
          if (!rateLimitResult.success) {
            return null;
          }

          // Try TOTP first (6-digit code)
          if (/^\d{6}$/.test(totpCode)) {
            if (!validateTOTP(totpCode, user.totp_secret)) {
              return null;
            }
          } else {
            // Try backup code (8-char hex)
            const storedHashes = parseBackupCodes(user.backup_codes);
            const { valid, updatedHashes } = validateBackupCode(totpCode, storedHashes);
            if (!valid) {
              return null;
            }
            // Mark backup code as used
            await prisma.user.update({
              where: { id: user.id },
              data: { backup_codes: updatedHashes },
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If it starts with base URL, allow it
      if (url.startsWith(baseUrl)) return url;
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/konto`;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        // Fetch role, onboarding status, and image from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { role: true, display_name: true, image: true, name: true },
        });
        token.role = (dbUser?.role ?? "BUYER") as "BUYER" | "SELLER" | "ADMIN";
        token.needsOnboarding = !dbUser?.display_name;
        token.picture = dbUser?.image ?? undefined;
        token.name = dbUser?.display_name || dbUser?.name || token.name;
      }
      // Refresh role, onboarding status, image, and name on session update
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, display_name: true, image: true, name: true },
        });
        token.role = (dbUser?.role ?? "BUYER") as "BUYER" | "SELLER" | "ADMIN";
        token.needsOnboarding = !dbUser?.display_name;
        token.picture = dbUser?.image ?? undefined;
        token.name = dbUser?.display_name || dbUser?.name || token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role ?? "BUYER") as "BUYER" | "SELLER" | "ADMIN";
        session.user.needsOnboarding = token.needsOnboarding ?? false;
        session.user.image = (token.picture as string) ?? null;
        session.user.name = (token.name as string) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/anmelden",
    newUser: "/willkommen",
  },
});

export const { handlers, signIn, signOut, auth } = nextAuth;

/**
 * Get the current authenticated user's ID
 * @returns The user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
