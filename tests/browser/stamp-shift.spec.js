const { test, expect } = require("@playwright/test");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const gameUrl = pathToFileURL(path.join(__dirname, "..", "..", "index.html")).toString();

test("direct-file launch runs practice, scored run, rank, and restart", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(gameUrl);
  await expect(page.getByRole("heading", { name: "Stamp Shift" })).toBeVisible();
  await page.getByRole("button", { name: "Start Practice" }).click();
  await expect(page.locator("#modeLabel")).toHaveText("Practice");

  for (let i = 0; i < 18; i += 1) {
    await page.keyboard.press("Space");
    await page.waitForTimeout(450);
  }

  await expect(page.locator("#rankPanel")).toBeVisible({ timeout: 50000 });
  await expect(page.locator("#rankTitle")).toContainText(/Try Again|Almost|Solid|Superb/);
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.locator("#modeLabel")).toHaveText("Practice");
  expect(errors).toEqual([]);
});
