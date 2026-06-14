import { expect, test, type Request } from "@playwright/test";

/**
 * The Phase-1 happy path (spec §13): load a generated 834 → table renders →
 * filter by Termination → open a member drawer → confirm the raw segments show.
 * Crucially, assert that no file bytes ever leave the browser.
 */
test("reads an 834 into a member table, filters, and opens a row — with no upload", async ({ page }) => {
  const requests: Request[] = [];
  page.on("request", (r) => requests.push(r));

  await page.goto("/");

  // Load the clean 834 sample (the chip whose name ends with "Enrollment";
  // the "· errors" chip ends differently). Chip names render without a space
  // between the code and label, so match by suffix.
  await page.getByRole("button", { name: /Enrollment$/ }).click();

  // The member table renders.
  await expect(page.getByPlaceholder("Search name or ID…")).toBeVisible();
  const rows = page.getByTestId("member-row");
  await expect(rows.first()).toBeVisible();

  // Filter by Termination and confirm the table updates.
  await page.getByLabel("Change type").selectOption("Termination");
  await expect(page.getByText(/of \d+ members/)).toBeVisible();
  await expect(rows.first()).toBeVisible();

  // Open the first member's drawer and confirm the raw segments are shown.
  await rows.first().click();
  await expect(page.getByText("The raw segments behind this row")).toBeVisible();
  await expect(page.getByText(/INS\*/)).toBeVisible();

  // PRIVACY: no request body ever carried the file content (the file starts
  // with "ISA"), and nothing was sent to a foreign origin.
  for (const r of requests) {
    const body = r.postData();
    expect(body == null || !body.includes("ISA")).toBeTruthy();
  }
  const offOrigin = requests.filter(
    (r) => !/^(http:\/\/localhost:3000|blob:|data:)/.test(r.url()),
  );
  expect(offOrigin.map((r) => r.url())).toEqual([]);
});

/** The 835 demo lands on Findings, where denials are decoded into plain English. */
test("opens the 835 sample straight to decoded denials", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Open a sample 835/ }).click();
  await expect(page.getByText(/was denied/).first()).toBeVisible();
});
