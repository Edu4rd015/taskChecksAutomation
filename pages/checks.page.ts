import { expect, Locator, Page } from '@playwright/test';

export class ChecksPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // NOTE:
  // These locators are intentionally written in a resilient style,
  // but should be finalized after inspecting the real DOM.
  get pageHeading(): Locator {
    return this.page.getByRole('heading').first();
  }

  get checksNavLink(): Locator {
    return this.page.getByRole('link', { name: /checks/i }).first();
  }

  get locationFilter(): Locator {
    return this.page
      .getByRole('combobox')
      .or(this.page.getByRole('button', { name: /region/i }))
      .first();
  }

  get clearFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /clear|reset/i }).first();
  }

  get rows(): Locator {
    return this.page
      .locator('[role="row"]')
      .filter({ hasNot: this.page.getByRole('columnheader') });
  }

  get emptyState(): Locator {
    return this.page.getByText(/no data|no checks found|no matching/i).first();
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('/a/grafana-synthetic-monitoring-app/home');
  }

  async openChecks(): Promise<void> {
    await expect(this.page).toHaveURL(/play\.grafana\.org/);
    await this.checksNavLink.click();
  }

  async waitForChecksContent(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getRowCount(): Promise<number> {
    return await this.rows.count();
  }

  async openLocationFilter(): Promise<void> {
    await this.locationFilter.click();
  }

  async selectLocation(locationName: string): Promise<void> {
    await this.openLocationFilter();
    const option = this.page.getByRole('option', { name: new RegExp(locationName, 'i') }).first()
      .or(this.page.getByText(new RegExp(locationName, 'i')).first());
    await option.click();
  }

  async openFirstAvailableCheck(): Promise<string> {
    const firstRow = this.rows.first();
    await expect(firstRow).toBeVisible();
    const rowText = (await firstRow.innerText()).trim();
    await firstRow.click();
    return rowText;
  }

  async assertEveryVisibleRowContains(text: string): Promise<void> {
    const count = await this.rows.count();
    for (let i = 0; i < count; i++) {
      await expect(this.rows.nth(i)).toContainText(new RegExp(text, 'i'));
    }
  }
}
