/**
 * Admin Moderation E2E Tests.
 *
 * Tests admin material moderation including:
 * - Viewing pending materials
 * - Verifying materials
 * - Rejecting materials
 * - Status filter functionality
 */

import { test, expect } from "../../fixtures/auth.fixture";
import { AdminDocumentsPage } from "../../pages/admin-documents.page";
import { TEST_MATERIAL_IDS } from "../../fixtures/test-users";

test.describe("Admin Moderation", () => {
  test.beforeEach(async ({ adminPage }) => {
    // Mock the admin materials API to provide consistent test data
    await adminPage.route("**/api/admin/materials**", async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get("status") || "all";

      const mockMaterials = [
        {
          id: TEST_MATERIAL_IDS.PENDING_MATERIAL,
          title: "Pending Test Material",
          description: "A material waiting for moderation",
          price: 0,
          priceFormatted: "Gratis",
          subjects: ["Mathematik"],
          cycles: ["Zyklus 2"],
          is_published: true,
          is_approved: false,
          status: "PENDING",
          is_public: false,
          file_url: "/test/file.pdf",
          preview_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller: {
            id: "test-seller-001",
            display_name: "Test Seller",
            email: "test-seller@currico.test",
          },
          salesCount: 0,
        },
        {
          id: "verified-material-001",
          title: "Verified Test Material",
          description: "An approved material",
          price: 990,
          priceFormatted: "CHF 9.90",
          subjects: ["Deutsch"],
          cycles: ["Zyklus 1"],
          is_published: true,
          is_approved: true,
          status: "VERIFIED",
          is_public: true,
          file_url: "/test/verified.pdf",
          preview_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller: {
            id: "test-seller-001",
            display_name: "Test Seller",
            email: "test-seller@currico.test",
          },
          salesCount: 5,
        },
      ];

      // Filter based on status
      let filteredMaterials = mockMaterials;
      if (status === "pending") {
        filteredMaterials = mockMaterials.filter((r) => r.status === "PENDING");
      } else if (status === "approved") {
        filteredMaterials = mockMaterials.filter((r) => r.status === "VERIFIED");
      }

      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            materials: filteredMaterials,
            pagination: {
              page: 1,
              limit: 10,
              total: filteredMaterials.length,
              totalPages: 1,
            },
          }),
        });
      } else if (route.request().method() === "PATCH") {
        // Handle status update
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });
  });

  test("admin can view pending materials", async ({ adminPage }) => {
    const documentsPage = new AdminDocumentsPage(adminPage);

    // Navigate to admin documents page
    await documentsPage.goto();

    // Select pending filter
    await documentsPage.selectStatusFilter("pending");

    // Should show pending materials
    await documentsPage.expectMaterialVisible("Pending Test Material");
  });

  test("admin can verify a material", async ({ adminPage }) => {
    const documentsPage = new AdminDocumentsPage(adminPage);

    // Navigate to admin documents page
    await documentsPage.goto();

    // Select pending filter to find pending materials
    await documentsPage.selectStatusFilter("pending");

    // Open review modal for the pending material
    await documentsPage.openReviewModal("Pending Test Material");

    // Verify the modal is open
    await expect(documentsPage.reviewModal).toBeVisible();

    // Click verify button
    await documentsPage.verifyMaterial();

    // Modal should close
    await expect(documentsPage.reviewModal).toBeHidden();
  });

  test("admin can reject a material", async ({ adminPage }) => {
    const documentsPage = new AdminDocumentsPage(adminPage);

    // Navigate to admin documents page
    await documentsPage.goto();

    // Select pending filter
    await documentsPage.selectStatusFilter("pending");

    // Open review modal
    await documentsPage.openReviewModal("Pending Test Material");

    // Verify the modal is open
    await expect(documentsPage.reviewModal).toBeVisible();

    // Click reject button
    await documentsPage.rejectMaterial();

    // Modal should close
    await expect(documentsPage.reviewModal).toBeHidden();
  });

  test("status filter shows correct materials", async ({ adminPage }) => {
    const documentsPage = new AdminDocumentsPage(adminPage);

    // Navigate to admin documents page
    await documentsPage.goto();

    // Test pending filter
    await documentsPage.selectStatusFilter("pending");
    await documentsPage.expectMaterialVisible("Pending Test Material");

    // Verified material should NOT be visible with pending filter
    const verifiedVisible = await adminPage
      .locator("text=Verified Test Material")
      .isVisible()
      .catch(() => false);
    expect(verifiedVisible).toBe(false);

    // Test approved filter
    await documentsPage.selectStatusFilter("approved");
    await documentsPage.expectMaterialVisible("Verified Test Material");

    // Pending material should NOT be visible with approved filter
    const pendingVisible = await adminPage
      .locator("text=Pending Test Material")
      .isVisible()
      .catch(() => false);
    expect(pendingVisible).toBe(false);

    // Test all filter
    await documentsPage.selectStatusFilter("all");
    // Both should be visible with 'all' filter
    await documentsPage.expectMaterialVisible("Pending Test Material");
    await documentsPage.expectMaterialVisible("Verified Test Material");
  });
});

test.describe("Admin Review Modal", () => {
  test.beforeEach(async ({ adminPage }) => {
    // Set up mock for admin materials API
    await adminPage.route("**/api/admin/materials**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            materials: [
              {
                id: "test-material-review",
                title: "Material for Review",
                description: "Detailed description of the material for review",
                price: 1500,
                priceFormatted: "CHF 15.00",
                subjects: ["Mathematik", "NMG"],
                cycles: ["Zyklus 1", "Zyklus 2"],
                is_published: true,
                is_approved: false,
                status: "PENDING",
                is_public: false,
                file_url: "/test/review.pdf",
                preview_url: "/test/preview.png",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                seller: {
                  id: "seller-001",
                  display_name: "Material Seller",
                  email: "seller@currico.test",
                },
                salesCount: 0,
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
            },
          }),
        });
      } else if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });
  });

  test("review modal displays material details", async ({ adminPage }) => {
    const documentsPage = new AdminDocumentsPage(adminPage);

    // Navigate to admin documents page
    await documentsPage.goto();

    // Open review modal
    await documentsPage.openReviewModal("Material for Review");

    // Verify modal content
    await expect(documentsPage.modalTitle).toBeVisible();
    await expect(documentsPage.modalTitle).toHaveText("Dokument prüfen");

    // Verify material details are shown in modal (use heading for title to be specific)
    await expect(adminPage.getByRole("heading", { name: "Material for Review" })).toBeVisible();
    // Use first() for elements that may appear multiple times
    await expect(adminPage.locator("text=CHF 15.00").first()).toBeVisible();
    await expect(adminPage.locator("text=Material Seller").first()).toBeVisible();

    // Verify action buttons are visible
    await expect(documentsPage.verifyButton).toBeVisible();
    await expect(documentsPage.rejectButton).toBeVisible();
  });

  test("modal can be closed without action", async ({ adminPage }) => {
    const documentsPage = new AdminDocumentsPage(adminPage);

    // Navigate and open modal
    await documentsPage.goto();
    await documentsPage.openReviewModal("Material for Review");

    // Verify modal is open
    await expect(documentsPage.reviewModal).toBeVisible();

    // Close modal
    await documentsPage.closeReviewModal();

    // Verify modal is closed
    await expect(documentsPage.reviewModal).toBeHidden();
  });
});
