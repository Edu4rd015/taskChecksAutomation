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

## Open HTML report
```bash
npx playwright show-report
```

## Notes
- The project uses Playwright + TypeScript.
- Locators are intentionally resilient but may need small adjustments after inspecting the live DOM.
- Because this is a public demo, data may change over time. Assertions are written to reduce brittleness.
