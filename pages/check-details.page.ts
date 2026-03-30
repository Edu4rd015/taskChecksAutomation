import { expect, Locator, Page } from '@playwright/test';

export class CheckDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading(): Locator {
    return this.page.getByRole('heading').first();
  }

  get detailsContainer(): Locator {
    return this.page.locator('main, [role="main"], body').first();
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.detailsContainer).toBeVisible();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertMatchesSelectedCheck(selectedRowText: string): Promise<void> {
    const normalized = selectedRowText.split('\n')[0]?.trim();
    if (normalized) {
      await expect(this.page.locator('body')).toContainText(normalized);
    }
  }
}
