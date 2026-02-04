/**
 * Main seed script for Currico database
 *
 * This script is run automatically by `npx prisma db seed`
 * It seeds all required data for the application to function.
 *
 * Run manually with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { FACHBEREICHE } from "../lib/data/lehrplan21";

const prisma = new PrismaClient();

async function seedCurriculum() {
  console.log("Seeding curriculum data...");

  // Check if LP21 curriculum already exists
  const existing = await prisma.curriculum.findUnique({
    where: { code: "LP21" },
    include: { subjects: true },
  });

  if (existing && existing.subjects.length > 0) {
    console.log("  LP21 curriculum already seeded, skipping.");
    return;
  }

  // Create or get LP21 curriculum
  const curriculum = await prisma.curriculum.upsert({
    where: { code: "LP21" },
    update: {},
    create: {
      code: "LP21",
      name_de: "Lehrplan 21",
      name_fr: "Plan d'études romand",
      region: "D-CH",
    },
  });
  console.log(`  Curriculum: ${curriculum.code} (${curriculum.id})`);

  let subjectCount = 0;
  let competencyCount = 0;

  for (const fb of FACHBEREICHE) {
    // Create the subject
    const subject = await prisma.curriculumSubject.create({
      data: {
        code: fb.code,
        name_de: fb.name,
        color: fb.color,
        icon: fb.icon,
        curriculum_id: curriculum.id,
      },
    });
    subjectCount++;

    // Create competencies for each Kompetenzbereich and Kompetenz
    for (const kb of fb.kompetenzbereiche) {
      for (const cycle of fb.cycles) {
        // Create the Kompetenzbereich as a parent competency
        const kbCompetency = await prisma.curriculumCompetency.create({
          data: {
            code: `${kb.code}_Z${cycle}`,
            description_de: kb.name,
            cycle: cycle,
            kompetenzbereich: kb.code,
            subject_id: subject.id,
          },
        });
        competencyCount++;

        // Create each Kompetenz under this Kompetenzbereich
        for (const k of kb.kompetenzen) {
          await prisma.curriculumCompetency.create({
            data: {
              code: `${k.code}_Z${cycle}`,
              description_de: k.name,
              cycle: cycle,
              kompetenzbereich: kb.code,
              handlungsaspekt: k.code,
              parent_id: kbCompetency.id,
              subject_id: subject.id,
            },
          });
          competencyCount++;
        }
      }
    }
  }

  console.log(`  Created ${subjectCount} subjects and ${competencyCount} competencies`);
}

async function seedTestUsers() {
  console.log("Seeding test users...");

  // Admin user - admin@currico.ch / admin123
  const adminPasswordHash = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@currico.ch" },
    update: {
      password_hash: adminPasswordHash,
      updated_at: new Date(),
    },
    create: {
      email: "admin@currico.ch",
      password_hash: adminPasswordHash,
      name: "Administrator",
      display_name: "Administrator",
      role: "ADMIN",
      is_protected: true,
      emailVerified: new Date(),
    },
  });
  console.log(`  Admin user: ${admin.email} (password: admin123)`);

  // Test user - test@test.com / test
  const testPasswordHash = await hash("test", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {
      password_hash: testPasswordHash,
      updated_at: new Date(),
    },
    create: {
      email: "test@test.com",
      password_hash: testPasswordHash,
      name: "Test User",
      display_name: "Test User",
      role: "BUYER",
      emailVerified: new Date(),
    },
  });
  console.log(`  Test user: ${testUser.email} (password: test)`);
}

async function main() {
  console.log("========================================");
  console.log("Currico Database Seed");
  console.log("========================================\n");

  await seedCurriculum();
  await seedTestUsers();

  console.log("\n========================================");
  console.log("Seed completed!");
  console.log("========================================");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
