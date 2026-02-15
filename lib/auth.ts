import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
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
        // Fetch role and onboarding status from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { role: true, display_name: true },
        });
        token.role = (dbUser?.role ?? "BUYER") as "BUYER" | "SELLER" | "ADMIN";
        token.needsOnboarding = !dbUser?.display_name;
      }
      // Refresh role and onboarding status on session update
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, display_name: true },
        });
        token.role = (dbUser?.role ?? "BUYER") as "BUYER" | "SELLER" | "ADMIN";
        token.needsOnboarding = !dbUser?.display_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role ?? "BUYER") as "BUYER" | "SELLER" | "ADMIN";
        session.user.needsOnboarding = token.needsOnboarding ?? false;
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
