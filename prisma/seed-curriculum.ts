/**
 * Seed script for Lehrplan 21 curriculum data
 *
 * This script populates the database with curriculum data from the static
 * lehrplan21.ts file. Run with: npm run db:seed-curriculum
 */

import { PrismaClient } from "@prisma/client";
import { FACHBEREICHE } from "../lib/data/lehrplan21";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting curriculum seed...");

  // 1. Create or update the LP21 curriculum
  console.log("Creating LP21 curriculum...");
  const curriculum = await prisma.curriculum.upsert({
    where: { code: "LP21" },
    update: {
      name_de: "Lehrplan 21",
      name_fr: "Plan d'études romand",
      region: "D-CH",
    },
    create: {
      code: "LP21",
      name_de: "Lehrplan 21",
      name_fr: "Plan d'études romand",
      region: "D-CH",
    },
  });
  console.log(`  Created curriculum: ${curriculum.code} (${curriculum.id})`);

  // 2. Create subjects (Fachbereiche)
  console.log("\nCreating subjects (Fachbereiche)...");
  let subjectCount = 0;
  let competencyCount = 0;

  for (const fb of FACHBEREICHE) {
    // Upsert the subject
    const subject = await prisma.curriculumSubject.upsert({
      where: {
        curriculum_id_code: {
          curriculum_id: curriculum.id,
          code: fb.code,
        },
      },
      update: {
        name_de: fb.name,
        color: fb.color,
        icon: fb.icon,
      },
      create: {
        code: fb.code,
        name_de: fb.name,
        color: fb.color,
        icon: fb.icon,
        curriculum_id: curriculum.id,
      },
    });
    subjectCount++;
    console.log(`  Created subject: ${fb.code} - ${fb.name}`);

    // 3. Create competencies (Kompetenzbereiche and Kompetenzen)
    for (const kb of fb.kompetenzbereiche) {
      // Create the Kompetenzbereich as a competency
      // For each cycle that this subject supports
      for (const cycle of fb.cycles) {
        const kbCompetency = await prisma.curriculumCompetency.upsert({
          where: { code: `${kb.code}_Z${cycle}` },
          update: {
            description_de: kb.name,
            cycle: cycle,
            kompetenzbereich: kb.code,
            subject_id: subject.id,
          },
          create: {
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
          await prisma.curriculumCompetency.upsert({
            where: { code: `${k.code}_Z${cycle}` },
            update: {
              description_de: k.name,
              cycle: cycle,
              kompetenzbereich: kb.code,
              handlungsaspekt: k.code,
              parent_id: kbCompetency.id,
              subject_id: subject.id,
            },
            create: {
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

  console.log("\n========================================");
  console.log("Curriculum seed completed successfully!");
  console.log(`  Curriculum: 1 (LP21)`);
  console.log(`  Subjects: ${subjectCount}`);
  console.log(`  Competencies: ${competencyCount}`);
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("Error seeding curriculum:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
