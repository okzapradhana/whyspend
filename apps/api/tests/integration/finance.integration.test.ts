import { describe, expect, it } from "vitest";
import { buildServer } from "../../src/server/routes.js";
import { createSession } from "../setup.js";

const describeDb = process.env.SKIP_DB_TESTS === "1" ? describe.skip : describe;

describeDb("finance flows", () => {
  it("creates budgets, transactions, and savings goals with monthly summaries", async () => {
    const app = buildServer();
    const session = await createSession(app);
    const auth = { authorization: `Bearer ${session.token}` };

    const categoriesResponse = await app.inject({
      method: "GET",
      url: `/api/households/${session.household.id}/categories?type=expense`,
      headers: auth
    });

    const categories = categoriesResponse.json().categories;
    const groceries = categories.find((category: { name: string }) => category.name === "Kebutuhan Dapur");
    expect(groceries).toBeTruthy();

    const budget = await app.inject({
      method: "PUT",
      url: `/api/households/${session.household.id}/budgets/category/${groceries.id}`,
      headers: auth,
      payload: {
        month: "2026-06",
        amount: 4_000_000
      }
    });
    expect(budget.statusCode).toBe(200);

    const incomeCategories = await app.inject({
      method: "GET",
      url: `/api/households/${session.household.id}/categories?type=income`,
      headers: auth
    });
    const salary = incomeCategories.json().categories.find((category: { name: string }) => category.name === "Salary");

    const goals = await app.inject({
      method: "GET",
      url: `/api/households/${session.household.id}/savings-goals`,
      headers: auth
    });
    const emergencyGoal = goals.json().goals.find((goal: { name: string }) => goal.name === "Emergency Fund");

    await app.inject({
      method: "POST",
      url: `/api/households/${session.household.id}/transactions`,
      headers: auth,
      payload: {
        type: "income",
        amount: 15_000_000,
        occurredOn: "2026-06-20",
        categoryId: salary.id,
        ownerUserId: session.user.id,
        scope: "member",
        note: "Monthly payroll"
      }
    });

    await app.inject({
      method: "POST",
      url: `/api/households/${session.household.id}/transactions`,
      headers: auth,
      payload: {
        type: "expense",
        amount: 850_000,
        occurredOn: "2026-06-22",
        categoryId: groceries.id,
        ownerUserId: session.user.id,
        scope: "household",
        note: "Groceries and rice refill"
      }
    });

    await app.inject({
      method: "POST",
      url: `/api/households/${session.household.id}/transactions`,
      headers: auth,
      payload: {
        type: "savings",
        amount: 2_500_000,
        occurredOn: "2026-06-18",
        categoryId: emergencyGoal.categoryId,
        ownerUserId: session.user.id,
        scope: "household",
        note: "Automatic transfer"
      }
    });

    const summary = await app.inject({
      method: "GET",
      url: `/api/households/${session.household.id}/summaries/monthly?month=2026-06`,
      headers: auth
    });

    expect(summary.statusCode).toBe(200);
    expect(summary.json().totals.income).toBe(15_000_000);
    expect(summary.json().totals.expenses).toBe(850_000);
    expect(summary.json().totals.savings).toBe(2_500_000);
    expect(summary.json().budgetStatuses[0].categoryName).toBe("Kebutuhan Dapur");

    const refreshedGoals = await app.inject({
      method: "GET",
      url: `/api/households/${session.household.id}/savings-goals`,
      headers: auth
    });

    const refreshedEmergencyGoal = refreshedGoals.json().goals.find((goal: { name: string }) => goal.name === "Emergency Fund");
    expect(refreshedEmergencyGoal.savedAmount).toBeGreaterThan(10_000_000);
  });
});
