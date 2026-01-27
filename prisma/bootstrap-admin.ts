import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    console.error("❌ ADMIN_EMAIL environment variable is required");
    process.exit(1);
  }

  if (!password) {
    console.error("❌ ADMIN_PASSWORD environment variable is required");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ ADMIN_PASSWORD must be at least 8 characters");
    process.exit(1);
  }

  console.log("🔐 Bootstrapping admin user...");

  const passwordHash = await hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash: passwordHash,
      updated_at: new Date(),
    },
    create: {
      email,
      password_hash: passwordHash,
      name: "Administrator",
      display_name: "Administrator",
      role: "ADMIN",
      is_protected: true,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin user ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Bootstrap failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
