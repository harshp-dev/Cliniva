import { expect, test } from "@playwright/test";

test("home page renders platform title", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Virtual Health Platform")).toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});
