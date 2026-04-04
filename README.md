# Grafana Synthetic Monitoring – Automation Submission

## Prerequisites
- Node.js 18+
- npm

## Install
```bash
npm install
npx playwright install
```

## Run tests
```bash
npx playwright test
```
Run this command from the project root folder (the directory where the `tests` folder is visible).

## Open HTML report
```bash
npx playwright show-report
```

## Notes
- The project uses Playwright + TypeScript.
- Locators are intentionally resilient but may need small adjustments after inspecting the live DOM.
- Because this is a public demo, data may change over time. Assertions are written to reduce brittleness.

## Automated Test Scenarios

### a. Filtering Checks by Location
a. Steps:
1. Navigate to the Synthetic Monitoring checks page.
2. Capture a valid visible check token at runtime.
3. Apply a filter using the checks search input.

b. Expected outcome:
1. The checks list updates to filtered results.
2. Only matching checks remain visible.

### b. Viewing Check Details
a. Steps:
1. Navigate to the checks page.
2. Open the first available check details view.
3. Wait for the details page to load.

b. Expected outcome:
1. The details page opens successfully.
2. Displayed content matches the selected check.

### c. Handling No Data Scenario
a. Steps:
1. Navigate to the checks page.
2. Apply a filter value that has no matches.

b. Expected outcome:
1. Zero checks are returned.
2. A clear no-data/empty-state message is shown.

Implementation reference: `tests/checks.spec.ts`
