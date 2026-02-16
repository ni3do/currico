import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find a user to be the seller
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found. Run seed first.");
    return;
  }

  console.log("Found user:", user.email);

  // Check if multi-page material exists
  let multiPageMaterial = await prisma.resource.findUnique({
    where: { id: "test-multi-page-resource" },
  });

  if (!multiPageMaterial) {
    multiPageMaterial = await prisma.resource.create({
      data: {
        id: "test-multi-page-resource",
        title: "Test Mathe Arbeitsblatt - Brüche",
        description:
          "Ein umfassendes Arbeitsblatt zum Thema Brüche für die 5. Klasse. Enthält Übungen zu Addition, Subtraktion und Multiplikation von Brüchen.",
        price: 500,
        file_url: "resources/test-resource.pdf",
        preview_url: "https://placehold.co/800x1131/e5e5e5/666666?text=Page+1",
        preview_urls: [
          "https://placehold.co/800x1131/e5e5e5/666666?text=Page+1",
          "https://placehold.co/800x1131/e5e5e5/666666?text=Page+2",
          "https://placehold.co/800x1131/e5e5e5/666666?text=Page+3",
        ],
        preview_count: 3,
        subjects: ["MA"],
        cycles: ["2"],
        is_published: true,
        is_approved: true,
        is_public: true,
        status: "VERIFIED",
        seller_id: user.id,
      },
    });
    console.log("Created multi-page material");
  } else {
    console.log("Multi-page material already exists");
  }

  // Check if single-page material exists
  let singlePageMaterial = await prisma.resource.findUnique({
    where: { id: "test-single-page-resource" },
  });

  if (!singlePageMaterial) {
    singlePageMaterial = await prisma.resource.create({
      data: {
        id: "test-single-page-resource",
        title: "Einseiter - Deutsch Grammatik Merkblatt",
        description:
          "Ein kompaktes Merkblatt zur deutschen Grammatik. Perfekt als Übersicht für Schüler der Mittelstufe.",
        price: 250,
        file_url: "resources/single-page.pdf",
        preview_url: "https://placehold.co/800x1131/d4edda/155724?text=Single+Page+Document",
        preview_urls: ["https://placehold.co/800x1131/d4edda/155724?text=Single+Page+Document"],
        preview_count: 1,
        subjects: ["DE"],
        cycles: ["2"],
        is_published: true,
        is_approved: true,
        is_public: true,
        status: "VERIFIED",
        seller_id: user.id,
      },
    });
    console.log("Created single-page material");
  } else {
    console.log("Single-page material already exists");
  }

  // Create bundle materials
  let bundleMaterial1 = await prisma.resource.findUnique({
    where: { id: "test-bundle-resource-1" },
  });
  if (!bundleMaterial1) {
    bundleMaterial1 = await prisma.resource.create({
      data: {
        id: "test-bundle-resource-1",
        title: "Naturkunde Arbeitsblatt 1 - Pflanzen",
        description: "Arbeitsblatt über Pflanzen und ihre Eigenschaften.",
        price: 300,
        file_url: "resources/bundle-1.pdf",
        preview_url: "https://placehold.co/800x1131/cce5ff/004085?text=Pflanzen",
        preview_urls: [
          "https://placehold.co/800x1131/cce5ff/004085?text=Pflanzen",
          "https://placehold.co/800x1131/cce5ff/004085?text=Pflanzen+2",
        ],
        preview_count: 2,
        subjects: ["NMG"],
        cycles: ["2"],
        is_published: true,
        is_approved: true,
        is_public: true,
        status: "VERIFIED",
        seller_id: user.id,
      },
    });
    console.log("Created bundle material 1");
  }

  let bundleMaterial2 = await prisma.resource.findUnique({
    where: { id: "test-bundle-resource-2" },
  });
  if (!bundleMaterial2) {
    bundleMaterial2 = await prisma.resource.create({
      data: {
        id: "test-bundle-resource-2",
        title: "Naturkunde Arbeitsblatt 2 - Tiere",
        description: "Arbeitsblatt über Tiere und ihre Lebensräume.",
        price: 300,
        file_url: "resources/bundle-2.pdf",
        preview_url: "https://placehold.co/800x1131/fff3cd/856404?text=Tiere",
        preview_urls: [
          "https://placehold.co/800x1131/fff3cd/856404?text=Tiere",
          "https://placehold.co/800x1131/fff3cd/856404?text=Tiere+2",
        ],
        preview_count: 2,
        subjects: ["NMG"],
        cycles: ["2"],
        is_published: true,
        is_approved: true,
        is_public: true,
        status: "VERIFIED",
        seller_id: user.id,
      },
    });
    console.log("Created bundle material 2");
  }

  let bundleMaterial3 = await prisma.resource.findUnique({
    where: { id: "test-bundle-resource-3" },
  });
  if (!bundleMaterial3) {
    bundleMaterial3 = await prisma.resource.create({
      data: {
        id: "test-bundle-resource-3",
        title: "Naturkunde Arbeitsblatt 3 - Wasser",
        description: "Arbeitsblatt über den Wasserkreislauf.",
        price: 300,
        file_url: "resources/bundle-3.pdf",
        preview_url: "https://placehold.co/800x1131/d1ecf1/0c5460?text=Wasser",
        preview_urls: ["https://placehold.co/800x1131/d1ecf1/0c5460?text=Wasser"],
        preview_count: 1,
        subjects: ["NMG"],
        cycles: ["2"],
        is_published: true,
        is_approved: true,
        is_public: true,
        status: "VERIFIED",
        seller_id: user.id,
      },
    });
    console.log("Created bundle material 3");
  }

  // Create bundle
  let bundle = await prisma.bundle.findUnique({ where: { id: "test-bundle" } });
  if (!bundle) {
    bundle = await prisma.bundle.create({
      data: {
        id: "test-bundle",
        title: "Naturkunde Komplettpaket - Zyklus 2",
        description:
          "Alle Naturkunde-Arbeitsblätter für Zyklus 2 in einem günstigen Paket. Enthält Material zu Pflanzen, Tieren und dem Wasserkreislauf. Sparen Sie 20% gegenüber dem Einzelkauf!",
        price: 720,
        subjects: ["NMG"],
        cycles: ["2"],
        cover_image_url: "https://placehold.co/800x600/e2e3e5/383d41?text=Naturkunde+Bundle",
        is_published: true,
        status: "VERIFIED",
        seller_id: user.id,
      },
    });
    console.log("Created bundle");
  }

  // Link materials to bundle
  const links = [
    { bundle_id: bundle.id, resource_id: bundleMaterial1.id },
    { bundle_id: bundle.id, resource_id: bundleMaterial2.id },
    { bundle_id: bundle.id, resource_id: bundleMaterial3.id },
  ];

  for (const link of links) {
    const existing = await prisma.bundleResource.findUnique({
      where: {
        bundle_id_resource_id: link,
      },
    });
    if (!existing) {
      await prisma.bundleResource.create({ data: link });
    }
  }

  console.log("\n========================================");
  console.log("Test materials created successfully!");
  console.log("========================================");
  console.log("\nMaterials to test:");
  console.log(`  Multi-page (3 pages): /materialien/${multiPageMaterial.id}`);
  console.log(`  Single-page (1 page): /materialien/${singlePageMaterial.id}`);
  console.log(`  Bundle: /bundles/${bundle.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
