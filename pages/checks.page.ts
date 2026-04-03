import { expect, Locator, Page } from '@playwright/test';

export class ChecksPage {
  readonly page: Page;
  private readonly checksPathPattern = /\/a\/grafana-synthetic-monitoring-app\/checks(?:\/|$|\?)/;

  constructor(page: Page) {
    this.page = page;
  }

  get checksHeading(): Locator {
    return this.page.getByRole('heading', { name: /^checks$/i }).first();
  }

  get searchChecksInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /search checks/i })
      .or(this.page.locator('input[placeholder*="Search by job name"]').first())
      .first();
  }

  get additionalFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /additional filters/i }).first();
  }

  get probesFilterInput(): Locator {
    return this.page.locator('input[placeholder="All probes"]').first();
  }

  get rows(): Locator {
    return this.page
      .locator('[role="row"]')
      .filter({ hasNot: this.page.getByRole('columnheader') });
  }

  get checkCards(): Locator {
    return this.page.getByRole('checkbox', { name: /^select check$/i });
  }

  get checkHeadings(): Locator {
    return this.page.getByRole('heading', { level: 3 });
  }

  get emptyState(): Locator {
    return this.page.getByText(/no data|no checks found|no matching|0 of \d+ total checks/i).first();
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('/a/grafana-synthetic-monitoring-app/home');
  }

  async openChecks(): Promise<void> {
    if (this.checksPathPattern.test(this.page.url())) {
      return;
    }
    await this.page.goto('/a/grafana-synthetic-monitoring-app/checks');
    await expect(this.page).toHaveURL(this.checksPathPattern);
  }

  async waitForChecksContent(): Promise<void> {
    await expect(this.page).toHaveURL(this.checksPathPattern);
    const allChecksRegion = this.page.getByRole('region', { name: /all checks/i }).first();
    if ((await allChecksRegion.count()) > 0) {
      await expect(allChecksRegion).toBeVisible();
    } else {
      await expect(this.checksHeading).toBeVisible();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getRowCount(): Promise<number> {
    const cardCount = await this.checkCards.count();
    if (cardCount > 0) {
      return cardCount;
    }
    return await this.rows.count();
  }

  async openFirstAvailableCheck(): Promise<string> {
    const firstHeading = this.checkHeadings.first();
    await expect(firstHeading).toBeVisible();
    const checkName = (await firstHeading.textContent())?.trim() ?? '';
    await this.page.getByRole('link', { name: /view dashboard/i }).first().click();
    return checkName;
  }

  async assertEveryVisibleRowContains(text: string): Promise<void> {
    const cardCount = await this.checkCards.count();
    if (cardCount > 0) {
      const listContainer = this.page.locator('main').first();
      await expect(listContainer).toContainText(new RegExp(text, 'i'));
      return;
    }

    const rowCount = await this.rows.count();
    for (let i = 0; i < rowCount; i++) {
      await expect(this.rows.nth(i)).toContainText(new RegExp(text, 'i'));
    }
  }

  async getFirstCheckName(): Promise<string> {
    const firstHeading = this.checkHeadings.first();
    await expect(firstHeading).toBeVisible();
    return ((await firstHeading.textContent()) ?? '').trim();
  }

  async searchChecks(searchText: string): Promise<void> {
    await expect(this.searchChecksInput).toBeVisible();
    await this.searchChecksInput.fill(searchText);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyLocationFilterViaProbes(searchTerm = 'frank'): Promise<string> {
    await expect(this.additionalFiltersButton).toBeVisible();
    await this.additionalFiltersButton.click();
    await expect(this.probesFilterInput).toBeVisible();
    await this.probesFilterInput.click();
    await this.probesFilterInput.fill(searchTerm);

    const firstOption = this.page.getByRole('option').first();
    await expect(firstOption).toBeVisible();
    const selectedProbe = ((await firstOption.textContent()) ?? '').trim();
    await firstOption.click();
    await this.page.keyboard.press('Escape');
    await this.page.waitForLoadState('domcontentloaded');
    return selectedProbe;
  }
}
