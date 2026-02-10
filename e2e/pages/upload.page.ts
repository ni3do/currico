/**
 * Upload Wizard Page Object.
 *
 * Handles interactions with the multi-step upload wizard including:
 * - Step 1: Basic information (title, description, language)
 * - Step 2: Curriculum alignment (cycle, subject, competencies)
 * - Step 3: Properties & pricing (price type, amount)
 * - Step 4: Files & legal (file upload, confirmations)
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class UploadPage extends BasePage {
  readonly path = "/upload";

  // Page header
  readonly pageTitle: Locator;
  readonly breadcrumb: Locator;

  // Step navigation
  readonly stepNavigation: Locator;
  readonly step1Button: Locator;
  readonly step2Button: Locator;
  readonly step3Button: Locator;
  readonly step4Button: Locator;

  // Draft indicator
  readonly draftIndicator: Locator;
  readonly discardButton: Locator;

  // Navigation buttons
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly publishButton: Locator;

  // Step 1: Basic Information
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly languageSelect: Locator;
  readonly resourceTypeSelect: Locator;

  // Step 2: Curriculum
  readonly cycle1Radio: Locator;
  readonly cycle2Radio: Locator;
  readonly cycle3Radio: Locator;
  readonly subjectDropdown: Locator;
  readonly cantonSelect: Locator;

  // Step 3: Properties & Price
  readonly freeRadio: Locator;
  readonly paidRadio: Locator;
  readonly priceInput: Locator;
  readonly editableCheckbox: Locator;

  // Step 4: Files & Legal
  readonly mainFileUpload: Locator;
  readonly previewUpload: Locator;
  readonly uploadedFilesList: Locator;
  readonly ownContentCheckbox: Locator;
  readonly noScansCheckbox: Locator;
  readonly noTrademarksCheckbox: Locator;
  readonly swissSpellingCheckbox: Locator;
  readonly sellerAgreementCheckbox: Locator;

  // Success/Error dialogs
  readonly successDialog: Locator;
  readonly errorDialog: Locator;
  readonly viewResourceButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator("h1").filter({ hasText: /hochladen|upload/i });
    this.breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');

    // Step navigation - use aria-label for more specific matching
    this.stepNavigation = page.locator('nav[aria-label="Upload-Schritte"]');
    this.step1Button = page.locator('button[aria-label*="Grundinformationen"]').first();
    this.step2Button = page.locator('button[aria-label*="Lehrplan"]').first();
    this.step3Button = page.locator('button[aria-label*="Eigenschaften"]').first();
    this.step4Button = page.locator('button[aria-label*="Dateien"]').first();

    // Draft indicator - be specific to avoid matching textarea content
    this.draftIndicator = page
      .locator("span, p")
      .filter({ hasText: /entwurf gespeichert|draft saved/i })
      .first();
    this.discardButton = page.getByRole("button", { name: /verwerfen|discard/i });

    // Navigation buttons - support both German and English, but be specific to avoid Next.js dev tools
    this.backButton = page.locator('button:text-is("Zurück"), button:text-is("Back")').first();
    this.nextButton = page.locator('button:text-is("Weiter"), button:text-is("Continue")').first();
    this.publishButton = page
      .locator('button:text-is("Veröffentlichen"), button:text-is("Publish")')
      .first();

    // Step 1: Basic Information - use placeholders for more reliable matching
    this.titleInput = page.getByPlaceholder(/bruchrechnen|übungsblätter/i);
    this.descriptionInput = page.getByPlaceholder(/beschreiben sie|ressource kurz/i);
    this.languageSelect = page
      .locator("select")
      .filter({ has: page.locator('option[value="de"]') })
      .first();
    this.resourceTypeSelect = page
      .locator("select")
      .filter({ has: page.locator('option[value="PDF"]') });

    // Step 2: Curriculum
    this.cycle1Radio = page.getByRole("radio", { name: /zyklus 1/i });
    this.cycle2Radio = page.getByRole("radio", { name: /zyklus 2/i });
    this.cycle3Radio = page.getByRole("radio", { name: /zyklus 3/i });
    this.subjectDropdown = page.getByRole("button", { name: /fach wählen|select subject/i });
    this.cantonSelect = page.locator("select").filter({ has: page.locator('option[value="ZH"]') });

    // Step 3: Properties & Price
    this.freeRadio = page.getByRole("radio", { name: /kostenlos.*frei|free/i });
    this.paidRadio = page.getByRole("radio", { name: /kostenpflichtig|paid.*preis/i });
    this.priceInput = page.getByPlaceholder(/5\.00|preis/i);
    this.editableCheckbox = page.getByRole("checkbox", { name: /editierbar|editable/i });

    // Step 4: Files & Legal
    this.mainFileUpload = page
      .locator("text=/hauptdatei|main file/i")
      .locator("..")
      .locator("input[type='file']");
    this.previewUpload = page
      .locator("text=/vorschaubild|preview/i")
      .locator("..")
      .locator("input[type='file']");
    this.uploadedFilesList = page.locator("text=/.pdf|.docx|.pptx/i");
    this.ownContentCheckbox = page.getByRole("checkbox", {
      name: /eigene inhalte|own content|CC0/i,
    });
    this.noScansCheckbox = page.getByRole("checkbox", { name: /keine.*scan|no.*scan/i });
    this.noTrademarksCheckbox = page.getByRole("checkbox", {
      name: /keine.*marken|no.*trademark/i,
    });
    this.swissSpellingCheckbox = page.getByRole("checkbox", {
      name: /schweizer rechtschreibung|swiss spelling/i,
    });
    this.sellerAgreementCheckbox = page.getByRole("checkbox", {
      name: /verkäufervereinbarung|seller agreement/i,
    });

    // Success/Error dialogs
    this.successDialog = page.locator("text=/ressource erstellt|resource created/i");
    this.errorDialog = page.locator("h3").filter({ hasText: /fehler|error/i });
    this.viewResourceButton = page.getByRole("button", { name: /zur ressource|view resource/i });
  }

  /**
   * Wait for the upload page to load.
   */
  async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
    // Forcefully dismiss cookie consent if present
    await this.dismissCookieConsentForce();
  }

  /**
   * Forcefully dismiss cookie consent dialog.
   */
  private async dismissCookieConsentForce(): Promise<void> {
    // Try multiple button names that might be used for cookie consent
    const buttonNames = ["Alle akzeptieren", "Accept all", "Akzeptieren", "Accept"];

    for (const name of buttonNames) {
      const acceptButton = this.page.getByRole("button", { name, exact: true });
      if (await acceptButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await acceptButton.click();
        await this.page.waitForTimeout(500);
        return;
      }
    }
  }

  /**
   * Get the current step number (1-4).
   */
  async getCurrentStep(): Promise<number> {
    // Check which step button is active/current
    const steps = [this.step1Button, this.step2Button, this.step3Button, this.step4Button];
    for (let i = 0; i < steps.length; i++) {
      const isActive = await steps[i]
        .getAttribute("class")
        .then((c) => c?.includes("active") || false)
        .catch(() => false);
      if (isActive) return i + 1;
    }
    return 1; // Default to step 1
  }

  /**
   * Navigate to a specific step.
   */
  async goToStep(step: 1 | 2 | 3 | 4): Promise<void> {
    const buttons = [this.step1Button, this.step2Button, this.step3Button, this.step4Button];
    await buttons[step - 1].click();
    await this.page.waitForTimeout(300); // Allow animation
  }

  /**
   * Fill step 1: Basic Information.
   */
  async fillBasicInfo(data: {
    title: string;
    description: string;
    language?: "de" | "en" | "fr" | "it";
    resourceType?: "PDF" | "Word" | "PowerPoint" | "Excel";
  }): Promise<void> {
    await this.titleInput.fill(data.title);
    await this.descriptionInput.fill(data.description);

    if (data.language) {
      await this.languageSelect.selectOption(data.language);
    }
    if (data.resourceType) {
      await this.resourceTypeSelect.selectOption(data.resourceType);
    }
  }

  /**
   * Fill step 2: Curriculum alignment.
   */
  async fillCurriculum(data: {
    cycle: 1 | 2 | 3;
    subject: string;
    canton?: string;
  }): Promise<void> {
    // Select cycle
    const cycleRadios = [this.cycle1Radio, this.cycle2Radio, this.cycle3Radio];
    await cycleRadios[data.cycle - 1].click();

    // Select subject
    await this.subjectDropdown.click();
    await this.page.getByRole("button", { name: new RegExp(data.subject, "i") }).click();

    // Select canton if provided
    if (data.canton) {
      await this.cantonSelect.selectOption(data.canton);
    }
  }

  /**
   * Fill step 3: Properties & Price.
   */
  async fillPricing(data: {
    isFree: boolean;
    price?: number;
    isEditable?: boolean;
  }): Promise<void> {
    if (data.isFree) {
      await this.freeRadio.click();
    } else {
      await this.paidRadio.click();
      if (data.price !== undefined) {
        await this.priceInput.fill(data.price.toString());
      }
    }

    if (data.isEditable) {
      await this.editableCheckbox.check();
    }
  }

  /**
   * Upload a file in step 4.
   */
  async uploadFile(filePath: string): Promise<void> {
    // Click the upload area to trigger file input
    const uploadArea = this.page.locator("text=/klicken sie hier|click here|dateien hinein/i");
    await uploadArea.click();

    // Set the file via file chooser
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await uploadArea.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  /**
   * Check all legal confirmations in step 4.
   */
  async checkAllLegalConfirmations(): Promise<void> {
    await this.ownContentCheckbox.check();
    await this.noScansCheckbox.check();
    await this.noTrademarksCheckbox.check();
    await this.swissSpellingCheckbox.check();
    await this.sellerAgreementCheckbox.check();
  }

  /**
   * Click the next button to proceed to the next step.
   */
  async clickNext(): Promise<void> {
    // Ensure cookie consent is dismissed before clicking
    await this.dismissCookieConsentForce();
    await this.nextButton.click();
    await this.page.waitForTimeout(300); // Allow animation
  }

  /**
   * Click the back button to go to the previous step.
   */
  async clickBack(): Promise<void> {
    await this.dismissCookieConsentForce();
    await this.backButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Click the publish button to submit the resource.
   */
  async clickPublish(): Promise<void> {
    await this.publishButton.click();
  }

  /**
   * Wait for the success dialog to appear.
   */
  async waitForSuccess(): Promise<void> {
    await expect(this.successDialog).toBeVisible({ timeout: 30000 });
  }

  /**
   * Wait for an error dialog to appear.
   */
  async waitForError(): Promise<void> {
    await expect(this.errorDialog).toBeVisible({ timeout: 10000 });
  }

  /**
   * Discard the current draft.
   */
  async discardDraft(): Promise<void> {
    await this.discardButton.click();
    // Confirm if dialog appears
    const confirmButton = this.page.getByRole("button", { name: /bestätigen|confirm|ja|yes/i });
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
  }

  /**
   * Check if a step is marked as complete.
   */
  async isStepComplete(step: 1 | 2 | 3 | 4): Promise<boolean> {
    const buttons = [this.step1Button, this.step2Button, this.step3Button, this.step4Button];
    const ariaLabel = (await buttons[step - 1].getAttribute("aria-label")) || "";
    return (
      ariaLabel.toLowerCase().includes("abgeschlossen") ||
      ariaLabel.toLowerCase().includes("complete")
    );
  }

  /**
   * Check if the publish button is enabled.
   */
  async isPublishEnabled(): Promise<boolean> {
    return this.publishButton.isEnabled();
  }

  /**
   * Assert that the page title is visible.
   */
  async expectPageVisible(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.stepNavigation).toBeVisible();
  }

  /**
   * Assert step 1 form is visible.
   */
  async expectStep1Visible(): Promise<void> {
    await expect(this.titleInput).toBeVisible();
    await expect(this.descriptionInput).toBeVisible();
  }

  /**
   * Assert step 2 form is visible.
   */
  async expectStep2Visible(): Promise<void> {
    await expect(this.cycle1Radio).toBeVisible();
    await expect(this.subjectDropdown).toBeVisible();
  }

  /**
   * Assert step 3 form is visible.
   */
  async expectStep3Visible(): Promise<void> {
    await expect(this.freeRadio).toBeVisible();
    await expect(this.paidRadio).toBeVisible();
  }

  /**
   * Assert step 4 form is visible.
   */
  async expectStep4Visible(): Promise<void> {
    await expect(this.ownContentCheckbox).toBeVisible();
    await expect(this.sellerAgreementCheckbox).toBeVisible();
  }
}
