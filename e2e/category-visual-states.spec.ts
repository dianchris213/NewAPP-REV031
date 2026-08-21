import {
  test,
  expect,
  EMPTY_STATE,
  MANY_CATEGORIES_STATE,
  activate,
  openCategorySheet,
  openWhenHydrated,
} from "./fixtures";
import type { Page } from "@playwright/test";

async function openSheet(page: Page) {
  const { row, sheet } = await openCategorySheet(page);
  await openWhenHydrated(
    () => row.click(),
    async () => {
      await expect(sheet).toBeVisible({ timeout: 1_000 });
    },
  );
  return sheet;
}

/**
 * Visual baselines beyond the "no results" case: a fully populated list, the
 * collapsed preview and the truly empty list. Refresh with `bun run e2e:update`.
 */
test.describe("Kategori Transaksi — visual states", () => {
  test.describe("populated", () => {
    test.use({ seed: MANY_CATEGORIES_STATE });

    test("matches the expanded and collapsed baselines", async ({ page }) => {
      const sheet = await openSheet(page);
      const rows = page.locator('[data-testid^="category-item-"]');

      await expect(rows).toHaveCount(5);
      await expect(sheet).toHaveScreenshot("category-list-expanded.png");

      await activate(page.getByTestId("category-toggle-all"));
      await expect(rows).toHaveCount(3);
      await expect(page.getByTestId("category-collapsed-notice")).toHaveText("3/5");
      await expect(sheet).toHaveScreenshot("category-list-collapsed.png");
    });

    test("matches the single-Jenis filtered baseline", async ({ page }) => {
      const sheet = await openSheet(page);
      await page.getByTestId("category-filter-type").selectOption("income");
      await expect(page.locator('[data-testid^="category-item-"]')).toHaveCount(2);
      await expect(sheet).toHaveScreenshot("category-list-income.png");
    });
  });

  test.describe("no categories yet", () => {
    test.use({ seed: EMPTY_STATE });

    test("matches the empty-list baseline", async ({ page }) => {
      const sheet = await openSheet(page);
      await expect(page.getByTestId("category-empty")).toBeVisible();
      await expect(page.getByTestId("category-empty-reset")).toHaveCount(0);
      await expect(sheet).toHaveScreenshot("category-list-empty.png");
    });
  });
});
