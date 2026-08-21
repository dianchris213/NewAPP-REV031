import { test as base, expect, type Page } from "@playwright/test";

const STORAGE_KEY = "tmab-state-v1";

/** Signed-in state with no categories — the empty state under test. */
export const EMPTY_STATE = {
  user: { id: "e2e-user", name: "E2E User", provider: "telegram" as const },
  transactions: [],
  wallets: [],
  walletActivity: [],
  categories: [],
  language: "id" as const,
};

/**
 * Deterministic populated dataset: two Pemasukan categories, one Pengeluaran
 * category and one wallet. Used for the filled-state visual baseline and for
 * the Kantong Dana dialog keyboard tests.
 */
export const FILLED_STATE = {
  ...EMPTY_STATE,
  wallets: [{ id: "w1", name: "Dompet Utama", type: "cash" as const, balance: 250000 }],
  categories: [
    { id: "cat-income-1", name: "Gaji", type: "income" as const },
    { id: "cat-income-2", name: "Bonus", type: "income" as const },
    { id: "cat-expense-1", name: "Makan", type: "expense" as const },
  ],
};

/**
 * Every E2E test starts authenticated with a deterministic dataset so
 * focus-order and visual baselines never depend on leftover local state.
 */
export const test = base.extend<{ seed: typeof EMPTY_STATE }>({
  seed: [EMPTY_STATE, { option: true }],
  page: async ({ page, seed }, use) => {
    await page.addInitScript(
      ([key, value]) => {
        window.localStorage.setItem(key as string, value as string);
      },
      [STORAGE_KEY, JSON.stringify(seed)] as const,
    );
    await use(page);
  },
});

export { expect };

/** Open Pengaturan > Kategori Transaksi and wait for the dialog. */
export async function openCategorySheet(page: Page) {
  await page.goto("/settings", { waitUntil: "domcontentloaded" });
  const row = page.getByRole("button", { name: /kategori/i }).first();
  await expect(row).toBeVisible();
  return { row, sheet: page.getByTestId("category-sheet") };
}

/** Click/press until hydration has attached the handler and the sheet opens. */
export async function openWhenHydrated(
  action: () => Promise<void>,
  isOpen: () => Promise<void>,
): Promise<void> {
  await expect(async () => {
    await action();
    await isOpen();
  }).toPass({ timeout: 15_000 });
}
