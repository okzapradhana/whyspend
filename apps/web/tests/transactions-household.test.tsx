import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionList } from "../src/features/transactions/TransactionList";
import { CategoryDrilldown } from "../src/features/summaries/CategoryDrilldown";
import type { Transaction } from "../src/lib/api/types";

const mockFrom = vi.fn();
const mockGetUser = vi.fn(async () => ({ data: { user: { id: "self-id" } } }));

vi.mock("../src/lib/supabaseClient", () => ({
  supabase: {
    get from() {
      return mockFrom;
    },
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args)
    }
  }
}));

import { listTransactions, createTransaction, updateTransaction } from "../src/lib/api/transactions";
import { getMonthlySummary } from "../src/lib/api/summaries";

const baseTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "t1",
  householdId: "h1",
  ownerUserId: "u1",
  categoryId: "c1",
  type: "expense",
  amount: 100000,
  occurredOn: "2026-06-15",
  month: "2026-06",
  scope: "household",
  note: "Groceries",
  owner: { userId: "u1", displayName: "Okza" },
  category: { id: "c1", name: "Groceries", type: "expense" },
  ...overrides
});

describe("transactions household crash regression", () => {
  it("TransactionList renders spouse transaction without throwing when owner is null (fallback to Member)", () => {
    const tx = baseTx({ owner: null as any });
    expect(() => render(<TransactionList transactions={[tx]} onEdit={vi.fn()} onDelete={vi.fn()} />)).not.toThrow();
    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("TransactionList renders spouse displayName when present", () => {
    const tx = baseTx({ owner: { userId: "spouse-id", displayName: "Ajeng" } });
    render(<TransactionList transactions={[tx]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Ajeng")).toBeInTheDocument();
  });

  it("TransactionList tolerates missing category", () => {
    const tx = baseTx({ category: null as any });
    expect(() => render(<TransactionList transactions={[tx]} onEdit={vi.fn()} onDelete={vi.fn()} />)).not.toThrow();
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("CategoryDrilldown tolerates missing owner identity", () => {
    const tx = baseTx({ owner: null as any });
    expect(() => render(<CategoryDrilldown categoryName="Groceries" transactions={[tx]} />)).not.toThrow();
    expect(screen.getByText(/Member/)).toBeInTheDocument();
  });

  it("owner search fallback is safe for null owner", () => {
    const txs = [
      baseTx({ id: "t1", owner: null as any, category: { id: "c1", name: "Groceries", type: "expense" }, note: "hello" }),
      baseTx({ id: "t2", owner: { userId: "u2", displayName: "Ajeng" }, category: { id: "c2", name: "Transport", type: "expense" }, note: null }),
    ];
    const query = "ajeng";
    const filtered = txs.filter((t) => {
      const ownerName = (t.owner?.displayName ?? "Member").toLowerCase();
      return ownerName.includes(query) || (t.category?.name ?? "").toLowerCase().includes(query) || (t.note ?? "").toLowerCase().includes(query);
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("t2");
    const memberQuery = "member";
    const filtered2 = txs.filter((t) => (t.owner?.displayName ?? "Member").toLowerCase().includes(memberQuery));
    expect(filtered2).toHaveLength(1);
    expect(filtered2[0].id).toBe("t1");
  });
});

function mockTransactionSelect(rows: unknown[]) {
  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          order: () => ({
            order: async () => ({ data: rows, error: null })
          })
        })
      })
    })
  } as any;
}

function mockIdentitySelect(data: unknown, error: unknown = null) {
  return {
    select: () => ({
      eq: () => ({
        in: async () => ({ data, error })
      })
    })
  } as any;
}

function mockSingle(data: unknown, error: unknown = null) {
  return {
    select: () => ({
      single: async () => ({ data, error })
    }),
    update: () => ({
      eq: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data, error })
          })
        })
      })
    })
  } as any;
}

describe("transaction API normalization (household projection)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "self-id" } } } as any);
  });

  it("listTransactions merges household_member_identity and falls back to embedded owner then Member", async () => {
    const txRows = [
      {
        id: "tx-spouse",
        householdId: "h1",
        ownerUserId: "spouse-id",
        categoryId: "c1",
        type: "expense",
        amount: 850000,
        occurredOn: "2026-06-22T00:00:00.000Z",
        month: "2026-06",
        scope: "household",
        note: "Groceries",
        owner: null,
        category: { id: "c1", name: "Kebutuhan Dapur", type: "expense" }
      },
      {
        id: "tx-self",
        householdId: "h1",
        ownerUserId: "self-id",
        categoryId: "c2",
        type: "expense",
        amount: 350000,
        occurredOn: "2026-06-15T00:00:00.000Z",
        month: "2026-06",
        scope: "member",
        note: null,
        owner: { userId: "self-id", displayName: "Okza" },
        category: { id: "c2", name: "Transport", type: "expense" }
      },
      {
        id: "tx-unknown",
        householdId: "h1",
        ownerUserId: "ghost-id",
        categoryId: "c1",
        type: "expense",
        amount: 10000,
        occurredOn: "2026-06-10T00:00:00.000Z",
        month: "2026-06",
        scope: "household",
        note: null,
        owner: null,
        category: null
      }
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === "household_member_identity") return mockIdentitySelect([{ userId: "spouse-id", displayName: "Ajeng" }]);
      if (table === "Transaction") return mockTransactionSelect(txRows);
      return mockIdentitySelect([]);
    });

    const result = await listTransactions("h1", { month: "2026-06" });
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions.find((t) => t.id === "tx-spouse")!.owner.displayName).toBe("Ajeng");
    // self row: projection had no self-id, should fallback to embedded owner Okza
    expect(result.transactions.find((t) => t.id === "tx-self")!.owner.displayName).toBe("Okza");
    expect(result.transactions.find((t) => t.id === "tx-unknown")!.owner.displayName).toBe("Member");
    expect(result.transactions.find((t) => t.id === "tx-unknown")!.category.name).toBe("Category");
  });

  it("listTransactions throws explicit error when household_member_identity lookup fails (no silent Member fallback)", async () => {
    const txRows = [
      {
        id: "tx-spouse",
        householdId: "h1",
        ownerUserId: "spouse-id",
        categoryId: "c1",
        type: "expense",
        amount: 850000,
        occurredOn: "2026-06-22T00:00:00.000Z",
        month: "2026-06",
        scope: "household",
        note: "Groceries",
        owner: null,
        category: { id: "c1", name: "Kebutuhan Dapur", type: "expense" }
      }
    ];
    mockFrom.mockImplementation((table: string) => {
      if (table === "household_member_identity") return mockIdentitySelect(null, { message: "relation does not exist", code: "42P01" } as any);
      if (table === "Transaction") return mockTransactionSelect(txRows);
      return mockIdentitySelect([]);
    });

    await expect(listTransactions("h1", { month: "2026-06" })).rejects.toThrow(/household_member_identity lookup failed/);
    await expect(listTransactions("h1", { month: "2026-06" })).rejects.toThrow(/42P01/);
  });

  it("createTransaction normalizes spouse owner via projection with same shape as list", async () => {
    const createdRow = {
      id: "new-tx",
      householdId: "h1",
      ownerUserId: "spouse-id",
      categoryId: "c1",
      type: "expense",
      amount: 500000,
      occurredOn: "2026-06-20T00:00:00.000Z",
      month: "2026-06",
      scope: "household",
      note: "Spouse expense",
      owner: null,
      category: { id: "c1", name: "Groceries", type: "expense" }
    };
    let insertedPayload: any = null;
    mockFrom.mockImplementation((table: string) => {
      if (table === "household_member_identity") return mockIdentitySelect([{ userId: "spouse-id", displayName: "Ajeng" }]);
      if (table === "Transaction") {
        return {
          insert: (payload: any) => {
            insertedPayload = payload;
            return {
              select: () => ({
                single: async () => ({ data: createdRow, error: null })
              })
            };
          }
        } as any;
      }
      return mockIdentitySelect([]);
    });

    const result = await createTransaction("h1", {
      type: "expense",
      amount: 500000,
      occurredOn: "2026-06-20",
      categoryId: "c1",
      ownerUserId: "spouse-id",
      scope: "household",
      note: "Spouse expense"
    });
    expect(insertedPayload.ownerUserId).toBe("spouse-id");
    expect(result.owner.displayName).toBe("Ajeng");
    expect(result.category.name).toBe("Groceries");
    expect(result.occurredOn).toBe("2026-06-20");
  });

  it("updateTransaction normalizes owner via projection with same shape", async () => {
    const updatedRow = {
      id: "tx1",
      householdId: "h1",
      ownerUserId: "spouse-id",
      categoryId: "c1",
      type: "expense",
      amount: 600000,
      occurredOn: "2026-06-21T00:00:00.000Z",
      month: "2026-06",
      scope: "household",
      note: "Updated",
      owner: null,
      category: { id: "c1", name: "Groceries", type: "expense" }
    };
    mockFrom.mockImplementation((table: string) => {
      if (table === "household_member_identity") return mockIdentitySelect([{ userId: "spouse-id", displayName: "Ajeng" }]);
      if (table === "Transaction") {
        return {
          update: () => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  single: async () => ({ data: updatedRow, error: null })
                })
              })
            })
          })
        } as any;
      }
      return mockIdentitySelect([]);
    });

    const result = await updateTransaction("h1", "tx1", { amount: 600000, ownerUserId: "spouse-id" });
    expect(result.owner.displayName).toBe("Ajeng");
    expect(result.amount).toBe(600000);
    expect(result.category.name).toBe("Groceries");
  });

  it("projection error on create fails before mutation (no duplicate-on-retry)", async () => {
    const insertSpy = vi.fn(() => ({
      select: () => ({ single: async () => ({ data: null, error: null }) })
    }));
    mockFrom.mockImplementation((table: string) => {
      if (table === "household_member_identity") return mockIdentitySelect(null, { message: "permission denied", code: "42501" } as any);
      if (table === "Transaction") return { insert: insertSpy } as any;
      return mockIdentitySelect([]);
    });

    await expect(
      createTransaction("h1", {
        type: "expense",
        amount: 100,
        occurredOn: "2026-06-20",
        categoryId: "c1",
        ownerUserId: "spouse-id",
        scope: "household",
        note: null
      })
    ).rejects.toThrow(/household_member_identity lookup failed/);
    // Must not have mutated before projection validated
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it("update without owner change: post-write projection failure does NOT throw after commit (uses fallback, avoids false save failure)", async () => {
    const updatedRow = {
      id: "tx1",
      householdId: "h1",
      ownerUserId: "self-id",
      categoryId: "c1",
      type: "expense",
      amount: 600000,
      occurredOn: "2026-06-21T00:00:00.000Z",
      month: "2026-06",
      scope: "household",
      note: "Updated",
      owner: null,
      category: { id: "c1", name: "Groceries", type: "expense" }
    };
    mockFrom.mockImplementation((table: string) => {
      if (table === "household_member_identity") return mockIdentitySelect(null, { message: "permission denied", code: "42501" } as any);
      if (table === "Transaction") {
        return {
          update: () => ({
            eq: () => ({
              eq: () => ({
                select: () => ({ single: async () => ({ data: updatedRow, error: null }) })
              })
            })
          })
        } as any;
      }
      return mockIdentitySelect([]);
    });

    // Should NOT throw after committed update; returns with Member fallback
    const result = await updateTransaction("h1", "tx1", { amount: 600000 });
    expect(result.owner.displayName).toBe("Member");
    expect(result.amount).toBe(600000);
  });
});

describe("summaries household projection degraded state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("getMonthlySummary throws explicit error on projection failure (does not masquerade as Member)", async () => {
    const txRows = [
      { id: "t1", householdId: "h1", ownerUserId: "spouse-id", categoryId: "c1", type: "expense", amount: 1000, occurredOn: "2026-06-15T00:00:00.000Z", month: "2026-06", scope: "household", owner: null, category: { id: "c1", name: "Groceries", type: "expense" } }
    ];
    mockFrom.mockImplementation((table: string) => {
      if (table === "Transaction") {
        return { select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ order: async () => ({ data: txRows, error: null }) }) }) }) }) } as any;
      }
      if (table === "CategoryBudget") {
        return { select: () => ({ eq: () => ({ eq: async () => ({ data: [], error: null }) }) }) } as any;
      }
      if (table === "household_member_identity") return mockIdentitySelect(null, { message: "relation does not exist", code: "42P01" } as any);
      return mockIdentitySelect([]);
    });

    await expect(getMonthlySummary("h1", "2026-06")).rejects.toThrow(/household_member_identity lookup failed/);
    await expect(getMonthlySummary("h1", "2026-06")).rejects.toThrow(/42P01/);
  });

  it("getMonthlySummary merges projection correctly and does not silently use Member when Ajeng is available", async () => {
    const txRows = [
      { id: "t1", householdId: "h1", ownerUserId: "spouse-id", categoryId: "c1", type: "expense", amount: 1000, occurredOn: "2026-06-15T00:00:00.000Z", month: "2026-06", scope: "household", owner: null, category: { id: "c1", name: "Groceries", type: "expense" } }
    ];
    mockFrom.mockImplementation((table: string) => {
      if (table === "Transaction") {
        return { select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ order: async () => ({ data: txRows, error: null }) }) }) }) }) } as any;
      }
      if (table === "CategoryBudget") {
        return { select: () => ({ eq: () => ({ eq: async () => ({ data: [], error: null }) }) }) } as any;
      }
      if (table === "household_member_identity") return mockIdentitySelect([{ userId: "spouse-id", displayName: "Ajeng" }]);
      return mockIdentitySelect([]);
    });

    const summary = await getMonthlySummary("h1", "2026-06");
    expect(summary.byMember.find((m) => m.userId === "spouse-id")!.displayName).toBe("Ajeng");
  });
});
