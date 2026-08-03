import type { Page, Route } from "@playwright/test";

export const REVIEW_USER = {
  id: "review-user",
  email: "design.review@example.test",
  displayName: "Design review"
};

export const REVIEW_HOUSEHOLD = {
  id: "review-household",
  name: "Review household",
  role: "owner"
};

const REVIEW_MONTH = "2026-08";
const jwt = [
  Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
  Buffer.from(JSON.stringify({
    aud: "authenticated",
    exp: 4102444800,
    email: REVIEW_USER.email,
    role: "authenticated",
    sub: REVIEW_USER.id,
    user_metadata: { displayName: REVIEW_USER.displayName }
  })).toString("base64url"),
  "design-review-signature"
].join(".");

type FixtureOptions = {
  empty?: boolean;
  household?: boolean;
  failTables?: string[];
  delayTables?: string[];
};

type FixtureState = ReturnType<typeof createState>;

function createState(empty = false) {
  const categories = [
    { id: "category-income", householdId: REVIEW_HOUSEHOLD.id, name: "Salary", type: "income", scope: "both", isArchived: false },
    { id: "category-expense", householdId: REVIEW_HOUSEHOLD.id, name: "Groceries", type: "expense", scope: "both", isArchived: false },
    { id: "category-savings", householdId: REVIEW_HOUSEHOLD.id, name: "Rainy day", type: "savings", scope: "both", isArchived: false }
  ];
  const transactions = empty ? [] : [
    transaction("transaction-income", "category-income", "income", 12_000_000, "Monthly income"),
    transaction("transaction-expense", "category-expense", "expense", 3_200_000, "Weekly groceries"),
    transaction("transaction-savings", "category-savings", "savings", 2_000_000, "Rainy day contribution")
  ];
  const budgets = empty ? [] : [{
    id: "budget-expense",
    householdId: REVIEW_HOUSEHOLD.id,
    categoryId: "category-expense",
    month: REVIEW_MONTH,
    amount: 4_000_000,
    category: { name: "Groceries", isArchived: false }
  }];
  const goals = empty ? [] : [{
    id: "goal-rainy-day",
    householdId: REVIEW_HOUSEHOLD.id,
    categoryId: "category-savings",
    targetAmount: 20_000_000,
    startingAmount: 5_000_000,
    targetDate: "2027-08-31T00:00:00.000Z",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    category: { name: "Rainy day", isArchived: false }
  }];
  return { categories, transactions, budgets, goals };
}

function transaction(id: string, categoryId: string, type: "income" | "expense" | "savings", amount: number, note: string) {
  const names = { "category-income": "Salary", "category-expense": "Groceries", "category-savings": "Rainy day" };
  return {
    id,
    householdId: REVIEW_HOUSEHOLD.id,
    ownerUserId: REVIEW_USER.id,
    categoryId,
    type,
    amount,
    occurredOn: "2026-08-08T00:00:00.000Z",
    month: REVIEW_MONTH,
    scope: "household",
    note,
    createdAt: "2026-08-08T00:00:00.000Z",
    owner: { userId: REVIEW_USER.id, displayName: REVIEW_USER.displayName },
    category: { id: categoryId, name: names[categoryId as keyof typeof names], type }
  };
}

function wantsObject(route: Route) {
  return route.request().headers().accept?.includes("application/vnd.pgrst.object+json") ?? false;
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, apikey, content-type, prefer, x-client-info",
      "access-control-allow-methods": "GET, HEAD, POST, PATCH, DELETE, OPTIONS",
      "content-range": "0-0/1"
    }
  });
}

function tableName(url: URL) {
  const marker = "/rest/v1/";
  return decodeURIComponent(url.pathname.slice(url.pathname.indexOf(marker) + marker.length));
}

function filterRows(table: string, state: FixtureState, url: URL) {
  if (table === "User") return [{ id: REVIEW_USER.id, email: REVIEW_USER.email, displayName: REVIEW_USER.displayName }];
  if (table === "HouseholdMember") {
    return [{ role: "owner", household: { id: REVIEW_HOUSEHOLD.id, name: REVIEW_HOUSEHOLD.name } }];
  }
  if (table === "Household") {
    return [{
      id: REVIEW_HOUSEHOLD.id,
      name: REVIEW_HOUSEHOLD.name,
      members: [{ userId: REVIEW_USER.id, role: "owner", user: { displayName: REVIEW_USER.displayName } }],
      invitations: []
    }];
  }
  if (table === "Category") {
    const type = url.searchParams.get("type")?.replace("eq.", "");
    return type ? state.categories.filter((category) => category.type === type) : state.categories;
  }
  if (table === "Transaction") {
    const type = url.searchParams.get("type")?.replace("eq.", "");
    const selected = type ? state.transactions.filter((record) => record.type === type) : state.transactions;
    const fields = decodeURIComponent(url.searchParams.get("select") ?? "");
    if (fields.replaceAll(" ", "") === "categoryId,amount") return selected.map(({ categoryId, amount }) => ({ categoryId, amount }));
    if (fields.replaceAll(" ", "") === "month,type,amount") return selected.map(({ month, type: rowType, amount }) => ({ month, type: rowType, amount }));
    return selected;
  }
  if (table === "CategoryBudget") return state.budgets;
  if (table === "SavingsGoal") return state.goals;
  if (table === "HouseholdInvitation") return [];
  return [];
}

async function handleRest(route: Route, state: FixtureState, options: FixtureOptions) {
  const request = route.request();
  const url = new URL(request.url());
  const table = tableName(url);
  if (options.delayTables?.includes(table)) await new Promise((resolve) => setTimeout(resolve, 900));
  if (options.failTables?.includes(table)) return json(route, { message: `Fixture failure for ${table}` }, 500);

  const method = request.method();
  if (method === "GET" || method === "HEAD") {
    if (table === "HouseholdMember" && options.household === false) return json(route, wantsObject(route) ? null : []);
    const rows = filterRows(table, state, url);
    return json(route, wantsObject(route) ? (rows[0] ?? null) : rows);
  }

  const body = request.postDataJSON() as Record<string, unknown> | Array<Record<string, unknown>> | null;
  const record = Array.isArray(body) ? body[0] : body ?? {};
  if (method === "POST" && table === "Category") {
    const created = { ...record, isArchived: false } as FixtureState["categories"][number];
    state.categories.push(created);
    return json(route, wantsObject(route) ? created : [created], 201);
  }
  if (method === "POST" && table === "Transaction") {
    const category = state.categories.find((item) => item.id === record.categoryId)!;
    const created = {
      ...record,
      occurredOn: String(record.occurredOn),
      owner: { userId: REVIEW_USER.id, displayName: REVIEW_USER.displayName },
      category: { id: category.id, name: category.name, type: category.type }
    } as FixtureState["transactions"][number];
    state.transactions.unshift(created);
    return json(route, wantsObject(route) ? created : [created], 201);
  }
  if (method === "POST" && table === "CategoryBudget") {
    const category = state.categories.find((item) => item.id === record.categoryId)!;
    const created = { ...record, category: { name: category.name, isArchived: category.isArchived } } as FixtureState["budgets"][number];
    state.budgets = state.budgets.filter((item) => item.categoryId !== created.categoryId || item.month !== created.month);
    state.budgets.push(created);
    return json(route, wantsObject(route) ? created : [created], 201);
  }
  if (method === "DELETE") return json(route, wantsObject(route) ? {} : []);
  if (method === "PATCH") return json(route, wantsObject(route) ? record : [record]);
  return json(route, wantsObject(route) ? record : [record], 201);
}

export async function installDesignReviewFixtures(page: Page, options: FixtureOptions = {}) {
  const state = createState(options.empty);
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`[design-review browser] ${message.text()}`);
  });
  page.on("pageerror", (error) => console.error(`[design-review page] ${error.message}`));
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "nmrxzxnurrxwqantrxhe.supabase.co") return route.continue();
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, apikey, content-type, prefer, x-client-info",
      "access-control-allow-methods": "GET, HEAD, POST, PATCH, DELETE, OPTIONS"
    }});
    if (url.pathname.includes("/rest/v1/")) return handleRest(route, state, options);
    if (url.pathname.endsWith("/token")) {
      return json(route, {
        access_token: jwt,
        refresh_token: "design-review-refresh-token",
        expires_in: 2_147_483_647,
        expires_at: 4_102_444_800,
        token_type: "bearer",
        user: {
          id: REVIEW_USER.id,
          aud: "authenticated",
          role: "authenticated",
          email: REVIEW_USER.email,
          user_metadata: { displayName: REVIEW_USER.displayName }
        }
      });
    }
    if (url.pathname.endsWith("/user")) {
      return json(route, {
        id: REVIEW_USER.id,
        aud: "authenticated",
        role: "authenticated",
        email: REVIEW_USER.email,
        user_metadata: { displayName: REVIEW_USER.displayName }
      });
    }
    return json(route, {});
  });
  return state;
}

export async function signInDesignReview(page: Page) {
  await page.addInitScript(({ accessToken, user }) => {
    localStorage.setItem("sb-nmrxzxnurrxwqantrxhe-auth-token", JSON.stringify({
      access_token: accessToken,
      refresh_token: "design-review-refresh-token",
      expires_in: 2_147_483_647,
      expires_at: 4_102_444_800,
      token_type: "bearer",
      user: {
        id: user.id,
        aud: "authenticated",
        role: "authenticated",
        email: user.email,
        user_metadata: { displayName: user.displayName }
      }
    }));
  }, { accessToken: jwt, user: REVIEW_USER });
  await page.goto("/dashboard");
  await page.waitForURL(/\/(dashboard|household-setup)$/);
}

export async function openPasswordRecoveryReview(page: Page) {
  const recoveryHash = new URLSearchParams({
    access_token: jwt,
    refresh_token: "design-review-recovery-token",
    expires_in: "2147483647",
    token_type: "bearer",
    type: "recovery"
  });
  await page.goto(`/update-password#${recoveryHash.toString()}`);
  await page.getByRole("textbox", { name: "New password", exact: true }).waitFor({ state: "visible" });
}
