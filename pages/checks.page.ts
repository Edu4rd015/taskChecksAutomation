import { expect, Locator, Page } from '@playwright/test';

export class ChecksPage {
  readonly page: Page;
  // Shared route matcher used by navigation and readiness checks.
  private readonly checksPathPattern = /\/a\/grafana-synthetic-monitoring-app\/checks(?:\/|$|\?)/;

  constructor(page: Page) {
    this.page = page;
  }

  get checksHeading(): Locator {
    // Primary page heading used as a simple "Checks page is visible" anchor.
    return this.page.getByRole('heading', { name: /^checks$/i }).first();
  }

  get additionalFiltersDialog(): Locator {
    // Scope dialog interactions so shared labels like "Close" stay unambiguous.
    return this.page.getByRole('dialog', { name: /additional filters/i }).first();
  }

  get closeButton(): Locator {
    // Use the dialog footer action instead of a page-wide text match.
    return this.additionalFiltersDialog.getByRole('button', { name: /^close$/i }).last();
  }

  get searchChecksInput(): Locator {
    // Search field for filtering checks; includes a fallback selector for UI variants.
    return this.page
      .getByRole('textbox', { name: /search checks/i })
      .or(this.page.locator('input[placeholder*="Search by job name"]').first())
      .first();
  }

  get additionalFiltersButton(): Locator {
    // Button that opens the panel with probe/location filters.
    return this.page.getByRole('button', { name: /additional filters/i }).first();
  }

  get probesFilterInput(): Locator {
    // Probe chooser input inside Additional filters.
    return this.page.locator('input[placeholder="All probes"]').first();
  }

  get rows(): Locator {
    // Table rows for checks data, excluding the header row.
    return this.page
      .locator('[role="row"]')
      .filter({ hasNot: this.page.getByRole('columnheader') });
  }

  get checkCards(): Locator {
    // Card-layout checks, identified through the per-card "select check" checkbox.
    return this.page.getByRole('checkbox', { name: /^select check$/i });
  }

  get checkHeadings(): Locator {
    // Check title headings used to capture and assert the selected check name.
    return this.page.getByRole('heading', { level: 3 });
  }

  get emptyState(): Locator {
    // Empty-result message shown when filters or search return no checks.
    return this.page.getByText(/no data|no checks found|no matching|0 of \d+ total checks/i).first();
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('/a/grafana-synthetic-monitoring-app/home');
  }

  async openChecks(): Promise<void> {
    // Fast-path: if a previous step already navigated here, avoid an extra reload.
    if (this.checksPathPattern.test(this.page.url())) {
      return;
    }
    await this.page.goto('/a/grafana-synthetic-monitoring-app/checks');
    await expect(this.page).toHaveURL(this.checksPathPattern);
  }

  async waitForChecksContent(): Promise<void> {
    await expect(this.page).toHaveURL(this.checksPathPattern);
    // The UI can render either the "All checks" region or a plain heading first.
    // Accept either state to keep synchronization resilient across browser engines.
    await this.page.waitForLoadState('domcontentloaded');
    const allChecksRegion = this.page.getByRole('region', { name: /all checks/i }).first();
    if ((await allChecksRegion.count()) > 0) {
      await expect(allChecksRegion).toBeVisible();
    } else {
      await expect(this.checksHeading).toBeVisible();
    }
    //await this.page.waitForLoadState('domcontentloaded');
  }

  async getRowCount(): Promise<number> {
    // Prefer card-style rows when present; otherwise fall back to table rows.
    const cardCount = await this.checkCards.count();
    if (cardCount > 0) {
      return cardCount;
    }
    return await this.rows.count();
  }

  async openFirstAvailableCheck(): Promise<string> {
    const firstHeading = this.checkHeadings.first();
    await expect(firstHeading).toBeVisible();
    // Capture text before navigating so the test can assert details-page continuity.
    const checkName = (await firstHeading.textContent())?.trim() ?? '';
    await this.page.getByRole('link', { name: /view dashboard/i }).first().click();
    return checkName;
  }

  async assertEveryVisibleRowContains(text: string): Promise<void> {
    // Card layout exposes fewer row-level handles; verify through the main container.
    const cardCount = await this.checkCards.count();
    if (cardCount > 0) {
      const listContainer = this.page.locator('main').first();
      await expect(listContainer).toContainText(new RegExp(text, 'i'));
      return;
    }

    // Table layout supports strict per-row assertions.
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
    // Wait for a render tick after filtering so follow-up count assertions are stable.
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyLocationFilterViaProbes(searchTerm = 'frank'): Promise<string> {
    // Flow: open the filter drawer, narrow probe options, pick the first match,
    // then close the popover and return the selected probe label for assertions.
    await expect(this.additionalFiltersButton).toBeVisible();
    await this.additionalFiltersButton.click();
    await expect(this.probesFilterInput).toBeVisible();
    await this.probesFilterInput.click();
    await this.probesFilterInput.fill(searchTerm);

    const firstOption = this.page.getByRole('option').first();
    await expect(firstOption).toBeVisible();
    const selectedProbe = ((await firstOption.textContent()) ?? '').trim();
    await firstOption.click();
    await expect(this.closeButton).toBeVisible();
    await this.closeButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    return selectedProbe;
  }
}
