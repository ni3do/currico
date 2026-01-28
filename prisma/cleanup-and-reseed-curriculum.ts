/**
 * Cleanup and Re-seed script for Lehrplan 21 curriculum data
 *
 * This script:
 * 1. Removes all existing curriculum data (competencies and subjects)
 * 2. Re-seeds from the clean lehrplan21.ts data
 *
 * Run with: npx tsx prisma/cleanup-and-reseed-curriculum.ts
 */

import { PrismaClient } from "@prisma/client";
import { FACHBEREICHE } from "../lib/data/lehrplan21";

const prisma = new PrismaClient();

async function main() {
  console.log("========================================");
  console.log("Curriculum Cleanup and Re-seed Script");
  console.log("========================================\n");

  // Step 1: Find the LP21 curriculum
  console.log("Step 1: Finding LP21 curriculum...");
  const curriculum = await prisma.curriculum.findUnique({
    where: { code: "LP21" },
  });

  if (!curriculum) {
    console.log("  LP21 curriculum not found. Creating it...");
    const newCurriculum = await prisma.curriculum.create({
      data: {
        code: "LP21",
        name_de: "Lehrplan 21",
        name_fr: "Plan d'études romand",
        region: "D-CH",
      },
    });
    console.log(`  Created curriculum: ${newCurriculum.code} (${newCurriculum.id})`);
  } else {
    console.log(`  Found curriculum: ${curriculum.code} (${curriculum.id})`);
  }

  const curriculumId =
    curriculum?.id || (await prisma.curriculum.findUnique({ where: { code: "LP21" } }))!.id;

  // Step 2: Delete all existing competencies for LP21
  console.log("\nStep 2: Deleting existing competencies...");
  const deletedCompetencies = await prisma.curriculumCompetency.deleteMany({
    where: {
      subject: {
        curriculum_id: curriculumId,
      },
    },
  });
  console.log(`  Deleted ${deletedCompetencies.count} competencies`);

  // Step 3: Delete all existing subjects for LP21
  console.log("\nStep 3: Deleting existing subjects...");
  const deletedSubjects = await prisma.curriculumSubject.deleteMany({
    where: {
      curriculum_id: curriculumId,
    },
  });
  console.log(`  Deleted ${deletedSubjects.count} subjects`);

  // Step 4: Re-seed subjects and competencies from lehrplan21.ts
  console.log("\nStep 4: Re-seeding from lehrplan21.ts...");
  console.log(`  Source has ${FACHBEREICHE.length} Fachbereiche\n`);

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
        curriculum_id: curriculumId,
      },
    });
    subjectCount++;
    console.log(`  Created subject: ${fb.code.padEnd(5)} - ${fb.name}`);

    // Create competencies for each Kompetenzbereich and Kompetenz
    for (const kb of fb.kompetenzbereiche) {
      // Create competency entries for each cycle this subject supports
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

  console.log("\n========================================");
  console.log("Cleanup and Re-seed completed!");
  console.log("========================================");
  console.log(`  Subjects created: ${subjectCount}`);
  console.log(`  Competencies created: ${competencyCount}`);
  console.log("");

  // Verify the results
  console.log("Verifying results...");
  const subjects = await prisma.curriculumSubject.findMany({
    where: { curriculum_id: curriculumId },
    orderBy: { code: "asc" },
  });

  console.log("\nSubjects in database:");
  for (const s of subjects) {
    console.log(`  ${s.code.padEnd(5)} | ${s.name_de}`);
  }

  // Check for expected codes
  const expectedCodes = [
    "D",
    "FR",
    "EN",
    "MA",
    "NMG",
    "BG",
    "TTG",
    "MU",
    "BS",
    "MI",
    "NT",
    "WAH",
    "RZG",
    "ERG",
    "BO",
    "PU",
  ];
  const foundCodes = subjects.map((s) => s.code);

  const missing = expectedCodes.filter((c) => !foundCodes.includes(c));
  const extra = foundCodes.filter((c) => !expectedCodes.includes(c));

  if (missing.length === 0 && extra.length === 0) {
    console.log("\n✓ All expected subjects present, no extras!");
  } else {
    if (missing.length > 0) {
      console.log("\n✗ Missing subjects:", missing.join(", "));
    }
    if (extra.length > 0) {
      console.log("\n✗ Extra subjects:", extra.join(", "));
    }
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
