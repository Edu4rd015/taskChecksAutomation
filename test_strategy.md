# QA Case Study – Grafana Synthetic Monitoring Demo

## 1) Objective
The goal is to validate core user flows in the Grafana Synthetic Monitoring demo, with focus on:
- filtering checks by location,
- opening and validating check details,
- handling empty-result or no-data scenarios.

The exercise requires 3 manual test cases and 2–3 automated UI scenarios. The platform under test is the Grafana Synthetic Monitoring App Demo described in the case-study brief.

## 2) Product understanding
Grafana Synthetic Monitoring provides an external perspective on application health by running checks from probe locations around the world and surfacing metrics and logs in Grafana. Grafana’s documentation and plugin description emphasize checks, probe locations, and visibility into service availability and correctness.

This makes filtering and check-detail navigation business-critical because users must be able to:
- find the relevant check quickly,
- isolate checks by location,
- inspect check details reliably,
- understand clearly when no matching data exists.

## 3) Scope
### In scope
- Checks list/table behavior
- Location filtering
- Check detail navigation
- Empty state / no matching data state
- Basic UI correctness and content consistency

### Out of scope
- Backend/API correctness
- Authentication/authorization
- Alerting workflows
- Historical metrics accuracy
- Cross-browser matrix beyond smoke validation
- Performance benchmarking/load testing

## 4) Test approach
### Manual testing
Manual testing is used first to:
- validate UX and expected behavior,
- identify stable selectors,
- understand dynamic content behavior,
- explore edge cases not worth automating immediately.

### UI automation
Automation is used for the most stable and highest-value regression paths:
1. filter checks by location,
2. open a check and validate detail view,
3. verify no-data or empty-result handling.

## 5) Prioritization
### High priority
- Filtering by location
- Navigation from list to detail page
- Empty-state clarity

### Medium priority
- Persistence/reset behavior of filters
- Loading indicators
- Sorting or secondary filters

### Lower priority
- Cosmetic layout issues that do not block user flow

## 6) Risks and mitigations
### Risk: dynamic or changing demo data
The demo data may change over time, which can make tests brittle if they depend on exact row counts or fixed check names.

**Mitigation:**
- avoid hardcoded counts,
- use relative assertions,
- validate state transitions rather than exact dataset content,
- use API/network assertions only when stable.

### Risk: fragile selectors
Class-based selectors may change with UI refactors.

**Mitigation:**
- prefer `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText` only where unique,
- prefer `data-testid` if available,
- isolate selectors in Page Objects.

### Risk: async rendering and delayed data
Filtering and detail pages may load asynchronously.

**Mitigation:**
- wait for visible landmarks,
- wait for request completion or stable UI state,
- avoid arbitrary sleeps.

## 7) Entry and exit criteria
### Entry criteria
- Demo URL accessible
- Checks page loads
- At least one check exists for normal-flow tests

### Exit criteria
- All critical flows executed manually
- Automated smoke suite passes
- Defects documented with reproduction steps and severity

## 8) Environments
- Browser: Chromium, Firefox, Webkit via Playwright
- OS: any desktop OS supported by Playwright
- Test framework: Playwright Test with TypeScript

## 9) Defect severity examples
### Critical
- Filtering returns wrong results without user feedback
- Clicking a check opens wrong details or no details

### Major
- No-data state is blank or misleading
- Detail view partially loads with missing key data

### Minor
- Label misalignment, spacing, minor visual issues

## 10) Recommended manual test cases

### TC-01 — Filter checks by location
**Precondition:** User is on the checks overview page.

**Steps:**
1. Open the Grafana Synthetic Monitoring demo.
2. Navigate to the checks page/list.
3. Open the location filter control.
4. Select one location.
5. Observe the displayed checks.

**Expected result:**
- Only checks associated with the selected location are shown.
- Non-matching checks are hidden.
- The filter state is visible to the user.

### TC-02 — View check details
**Precondition:** At least one check is visible in the checks list.

**Steps:**
1. Open the checks page.
2. Select any visible check.
3. Open the check details page/panel.

**Expected result:**
- The details screen opens successfully.
- The selected check’s core information is shown.
- The displayed check identity matches the selected list item.

### TC-03 — No-data scenario
**Precondition:** User is on the checks overview page.

**Steps:**
1. Open the checks page.
2. Apply a filter combination expected to return zero matching results.
3. Observe the page.

**Expected result:**
- A clear empty-state or no-data message is displayed.
- The UI does not appear broken or frozen.
- The user can recover by clearing or changing the filter.

## 11) Automation design
### Why Playwright
Playwright is a strong fit because it provides:
- robust waiting behavior,
- good locator support,
- parallel execution,
- trace/video/screenshot support,
- HTML reporting for easy review.

### Automation architecture
- `pages/checks.page.ts`: selectors and actions for checks page
- `pages/check-details.page.ts`: selectors and assertions for detail page
- `tests/*.spec.ts`: business-level scenarios
- `playwright.config.ts`: base URL, retries, reporter, trace/video settings

## 12) Handling dynamic data and UI behavior
The demo’s dynamic nature means tests should avoid depending on exact data values unless they are captured at runtime.

Recommended strategy:
- capture the clicked row’s visible name before navigation,
- validate the detail page contains that same name,
- assert filtered results are consistent with the selected location where location is visible,
- for no-data, validate the presence of an explicit empty-state indicator rather than exact text if needed.