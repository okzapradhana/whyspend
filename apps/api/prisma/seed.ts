import { hashPassword } from "../src/modules/auth/password.js";
import { prisma } from "../src/db/prisma.js";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_SAVINGS_GOALS } from "../src/db/defaults.js";

async function main() {
  await prisma.householdInvitation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.categoryBudget.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.householdMember.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();

  const owner = await prisma.user.create({
    data: {
      email: "okzamahendra29@gmail.com",
      displayName: "Okza",
      password: await hashPassword("password123")
    }
  });

  const spouse = await prisma.user.create({
    data: {
      email: "ajengprstw29@gmail.com",
      displayName: "Ajeng",
      password: await hashPassword("password123")
    }
  });

  const household = await prisma.household.create({
    data: {
      name: "Okza & Ajeng",
      members: {
        create: [
          { userId: owner.id, role: "owner" },
          { userId: spouse.id, role: "member" }
        ]
      }
    }
  });

  await prisma.category.createMany({
    data: [
      ...DEFAULT_INCOME_CATEGORIES.map((category) => ({
        householdId: household.id,
        name: category.name,
        type: "income" as const,
        scope: category.scope,
        createdByUserId: owner.id
      })),
      ...DEFAULT_EXPENSE_CATEGORIES.map((category) => ({
        householdId: household.id,
        name: category.name,
        type: "expense" as const,
        scope: category.scope,
        createdByUserId: owner.id
      })),
      ...DEFAULT_SAVINGS_GOALS.map((goal) => ({
        householdId: household.id,
        name: goal.name,
        type: "savings" as const,
        scope: "both" as const,
        createdByUserId: owner.id
      }))
    ]
  });

  const categories = await prisma.category.findMany({
    where: { householdId: household.id }
  });

  const byName = Object.fromEntries(categories.map((category) => [category.name, category]));

  await prisma.savingsGoal.createMany({
    data: DEFAULT_SAVINGS_GOALS.map((goal) => ({
      householdId: household.id,
      categoryId: byName[goal.name].id,
      targetAmount: goal.targetAmount,
      startingAmount: goal.startingAmount,
      targetDate: new Date(goal.targetDate)
    }))
  });

  await prisma.categoryBudget.createMany({
    data: [
      { householdId: household.id, categoryId: byName["Kebutuhan Dapur"].id, month: "2026-06", amount: 4_000_000, createdByUserId: owner.id, updatedByUserId: owner.id },
      { householdId: household.id, categoryId: byName["Transport (e-money)"].id, month: "2026-06", amount: 1_800_000, createdByUserId: owner.id, updatedByUserId: owner.id },
      { householdId: household.id, categoryId: byName["Skincare"].id, month: "2026-06", amount: 2_000_000, createdByUserId: owner.id, updatedByUserId: owner.id },
      { householdId: household.id, categoryId: byName["WiFi"].id, month: "2026-06", amount: 420_000, createdByUserId: owner.id, updatedByUserId: owner.id }
    ]
  });

  await prisma.transaction.createMany({
    data: [
      {
        householdId: household.id,
        ownerUserId: spouse.id,
        categoryId: byName["Kebutuhan Dapur"].id,
        type: "expense",
        scope: "household",
        amount: 850_000,
        occurredOn: new Date("2026-06-22"),
        month: "2026-06",
        note: "Groceries and rice refill",
        createdByUserId: spouse.id,
        updatedByUserId: spouse.id
      },
      {
        householdId: household.id,
        ownerUserId: owner.id,
        categoryId: byName["Salary"].id,
        type: "income",
        scope: "member",
        amount: 14_000_000,
        occurredOn: new Date("2026-06-20"),
        month: "2026-06",
        note: "Monthly payroll",
        createdByUserId: owner.id,
        updatedByUserId: owner.id
      },
      {
        householdId: household.id,
        ownerUserId: owner.id,
        categoryId: byName["Emergency Fund"].id,
        type: "savings",
        scope: "household",
        amount: 2_500_000,
        occurredOn: new Date("2026-06-18"),
        month: "2026-06",
        note: "Automatic transfer",
        createdByUserId: owner.id,
        updatedByUserId: owner.id
      },
      {
        householdId: household.id,
        ownerUserId: owner.id,
        categoryId: byName["Transport (e-money)"].id,
        type: "expense",
        scope: "member",
        amount: 350_000,
        occurredOn: new Date("2026-06-15"),
        month: "2026-06",
        note: "KRL and MRT top-up",
        createdByUserId: owner.id,
        updatedByUserId: owner.id
      },
      {
        householdId: household.id,
        ownerUserId: spouse.id,
        categoryId: byName["Skincare"].id,
        type: "expense",
        scope: "member",
        amount: 640_000,
        occurredOn: new Date("2026-06-12"),
        month: "2026-06",
        note: "Serum replacement",
        createdByUserId: spouse.id,
        updatedByUserId: spouse.id
      }
    ]
  });

  console.log("Seeded demo WhySpend data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
