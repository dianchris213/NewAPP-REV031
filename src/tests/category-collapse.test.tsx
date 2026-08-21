import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "@/lib/app-store";
import { CategorySheet } from "@/routes/settings";

const STORAGE_KEY = "tmab-state-v1";

/** 5 rows: more than the 3-row collapsed preview, so the toggle is rendered. */
const CATEGORIES = [
  { id: "c1", name: "Bonus", type: "income" as const },
  { id: "c2", name: "Gaji", type: "income" as const },
  { id: "c3", name: "Internet", type: "expense" as const },
  { id: "c4", name: "Kopi", type: "expense" as const },
  { id: "c5", name: "Makan", type: "expense" as const },
];

function seed() {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: { id: "u1", name: "Tester", provider: "telegram" },
      transactions: [],
      wallets: [],
      walletActivity: [],
      categories: CATEGORIES,
      language: "id",
    }),
  );
}

function rowCount() {
  return document.querySelectorAll('[data-testid^="category-item-"]').length;
}

async function setup() {
  const user = userEvent.setup();
  render(
    <AppProvider>
      <CategorySheet onClose={() => {}} />
    </AppProvider>,
  );
  await waitFor(() => expect(rowCount()).toBeGreaterThan(0));
  return user;
}

describe("Kategori Transaksi — collapsed list", () => {
  beforeEach(() => {
    window.localStorage.clear();
    seed();
  });

  it("shows only the first 3 rows with a labelled expand affordance", async () => {
    await setup();
    expect(rowCount()).toBe(3);
    const toggle = screen.getByTestId("category-toggle-all");
    expect(toggle).toHaveTextContent("Tampilkan semua (5)");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("reveals every row when the user picks “Tampilkan semua (N)”", async () => {
    const user = await setup();
    await user.click(screen.getByTestId("category-toggle-all"));
    await waitFor(() => expect(rowCount()).toBe(5));
    const toggle = screen.getByTestId("category-toggle-all");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Sembunyikan");
  });

  it("collapses again after switching the Jenis filter on and back off", async () => {
    const user = await setup();
    const select = screen.getByTestId("category-filter-type");

    // Filtering bypasses the collapse: all matching rows are shown and the
    // toggle disappears because the list is already filtered.
    await user.selectOptions(select, "expense");
    await waitFor(() => expect(rowCount()).toBe(3));
    expect(screen.queryByTestId("category-toggle-all")).toBeNull();

    // Turning the filter off restores the collapsed preview, not the full list.
    await user.selectOptions(select, "all");
    await waitFor(() => expect(screen.getByTestId("category-toggle-all")).toBeTruthy());
    expect(rowCount()).toBe(3);
    expect(screen.getByTestId("category-toggle-all")).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the expanded choice when a filter is applied and then cleared", async () => {
    const user = await setup();
    await user.click(screen.getByTestId("category-toggle-all"));
    await waitFor(() => expect(rowCount()).toBe(5));

    const select = screen.getByTestId("category-filter-type");
    await user.selectOptions(select, "income");
    await waitFor(() => expect(rowCount()).toBe(2));

    await user.selectOptions(select, "all");
    await waitFor(() => expect(rowCount()).toBe(5));
    expect(screen.getByTestId("category-toggle-all")).toHaveAttribute("aria-expanded", "true");
  });
});
