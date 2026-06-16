import { expect, test, type Request } from "@playwright/test";

const ANALYTICS = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com/;

/** Assert the core privacy invariant: no request ever carries the file content
 *  (the file starts with "ISA"), and the only off-origin requests are analytics. */
function assertNoFileLeak(requests: Request[]) {
  for (const r of requests) {
    const body = r.postData() ?? "";
    expect(body.includes("ISA*"), `request body to ${r.url()} carried file content`).toBeFalsy();
    expect(r.url().includes("ISA*"), `request URL carried file content`).toBeFalsy();
  }
  const offOrigin = requests.filter(
    (r) => !/^(http:\/\/localhost:3000|blob:|data:)/.test(r.url()),
  );
  for (const r of offOrigin) {
    expect(r.url(), "the only off-origin requests should be analytics").toMatch(ANALYTICS);
  }
}

/** The Phase-1 happy path (spec §13): load a generated 834 → table renders →
 *  filter by Termination → open a member drawer → confirm the raw segments show,
 *  with no file bytes leaving the browser. */
test("reads an 834 into a member table, filters, and opens a row — with no upload", async ({ page }) => {
  const requests: Request[] = [];
  page.on("request", (r) => requests.push(r));

  await page.goto("/");
  await page.getByRole("button", { name: /Enrollment$/ }).click();

  await expect(page.getByPlaceholder("Search name or ID…")).toBeVisible();
  const rows = page.getByTestId("member-row");
  await expect(rows.first()).toBeVisible();

  await page.getByLabel("Change type").selectOption("Termination");
  await expect(page.getByText(/of \d+ members/)).toBeVisible();
  await expect(rows.first()).toBeVisible();

  await rows.first().click();
  await expect(page.getByText("The raw segments behind this row")).toBeVisible();
  await expect(page.getByText(/INS\*/)).toBeVisible();

  assertNoFileLeak(requests);
});

/** The 835 demo lands on Findings, where denials are decoded into plain English. */
test("opens the 835 sample straight to decoded denials", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Open a sample 835/ }).click();
  await expect(page.getByText(/was denied/).first()).toBeVisible();
});

/** A reference page embeds the viewer: open a sample inline, results render on
 *  the same page — still with no file upload. */
test("reference page runs the embedded viewer inline", async ({ page }) => {
  const requests: Request[] = [];
  page.on("request", (r) => requests.push(r));

  await page.goto("/edi/835/");
  await expect(page.getByRole("heading", { name: "835.", exact: false })).toBeVisible();

  await page.getByRole("button", { name: /open a sample 835/i }).click();
  // The full results render inline on the reference page.
  await expect(page.getByRole("button", { name: /Open another file/i })).toBeVisible();
  await expect(page.getByText(/Total paid/i)).toBeVisible();

  assertNoFileLeak(requests);
});
