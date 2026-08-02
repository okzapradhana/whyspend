import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const sourceRoot = "/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0";

const checks = [
  {
    name: "shared shell",
    source: ["screens/dashboard.html", "assets/app.css"],
    targets: ["src/app/router.tsx", "src/styles/app.css"],
    required: [
      "drawer-backdrop",
      "mobile-bar",
      "app-shell",
      "sidebar",
      "brand",
      "brand-mark",
      "brand-title",
      "brand-subtitle",
      "nav-group",
      "nav-item",
      "nav-secondary",
      "screen",
      "content",
      "top-actions",
      "account-pill",
      "avatar-stack"
    ]
  },
  {
    name: "dashboard",
    source: ["screens/dashboard.html"],
    targets: [
      "src/features/summaries/SummaryPage.tsx",
      "src/features/summaries/CategoryChart.tsx",
      "src/features/summaries/BudgetStatusList.tsx",
      "src/features/summaries/HistoricalIncomeExpenseChart.tsx",
      "src/features/summaries/summaries.css"
    ],
    required: [
      "dashboard-head",
      "summary-metrics",
      "dashboard-charts",
      "budget-and-trend",
      "page-head",
      "metric-railed",
      "pie-chart",
      "legend-only",
      "budget-bar",
      "budget-row",
      "bar-track",
      "bar-fill",
      "line-chart",
      "detailed-trend"
    ]
  },
  {
    name: "transactions",
    source: ["screens/transactions.html"],
    targets: [
      "src/features/transactions/TransactionsPage.tsx",
      "src/features/transactions/TransactionForm.tsx",
      "src/features/transactions/TransactionList.tsx",
      "src/features/transactions/transactions.css",
      "src/components/Input.tsx",
      "src/components/Select.tsx"
    ],
    required: [
      "transactions-head",
      "transaction-controls",
      "transaction-list",
      "transaction-dialog",
      "filter-row",
      "filter-menu",
      "filter-button",
      "data-table",
      "fab-button",
      "transaction-modal",
      "amount-entry",
      "transaction-toggle",
      "modal-field",
      "soft-input",
      "modal-footer",
      "modal-action"
    ]
  },
  {
    name: "settings",
    source: ["screens/settings.html"],
    targets: [
      "src/features/settings/SettingsPage.tsx",
      "src/features/settings/UnifiedCategoryCard.tsx",
      "src/features/categories/CategoryList.tsx",
      "src/features/settings/settings.css"
    ],
    required: [
      "settings-head",
      "settings-content",
      "grid-main",
      "card"
    ],
    implementationOnly: [
      "unified-category-card",
      "settings-category-table",
      "settings-row-menu",
      "settings-access-card",
      "settings-category-dialog"
    ]
  },
  {
    name: "savings goals",
    source: ["screens/savings-goals.html"],
    targets: [
      "src/features/savings-goals/SavingsGoalsPage.tsx",
      "src/features/savings-goals/SavingsGoalCard.tsx",
      "src/features/savings-goals/SavingsGoalForm.tsx",
      "src/features/savings-goals/savings-goals.css"
    ],
    required: [
      "savings-head",
      "savings-summary",
      "goal-cards",
      "card-soft",
      "metric-value",
      "progress",
      "goal-grid",
      "goal-card",
      "goal-card-head",
      "row-icon",
      "goal-card-actions",
      "goal-menu-button",
      "goal-card-menu",
      "goal-meta-row",
      "goal-modal",
      "goal-modal-head",
      "goal-modal-close",
      "goal-modal-form",
      "goal-input-wrap",
      "currency-prefix",
      "goal-amount-grid",
      "goal-share-card",
      "goal-modal-footer",
      "delete-goal-modal",
      "delete-goal-head",
      "delete-goal-button"
    ]
  },
  {
    name: "auth",
    source: ["screens/login.html", "screens/signup.html"],
    targets: ["src/features/auth/AuthPage.tsx", "src/components/Input.tsx", "src/styles/app.css"],
    required: [
      "auth-page",
      "auth-page-login",
      "auth-shell",
      "auth-brand",
      "auth-wordmark",
      "auth-card",
      "auth-title",
      "auth-form",
      "auth-field",
      "auth-input-wrap",
      "auth-icon-button",
      "auth-status",
      "auth-submit",
      "auth-switch",
      "auth-policy"
    ]
  }
];

const failures = [];

for (const check of checks) {
  const sourceText = check.source
    .map((file) => {
      const path = resolve(sourceRoot, file);
      if (!existsSync(path)) {
        failures.push(`${check.name}: missing OpenDesign source ${path}`);
        return "";
      }
      return readFileSync(path, "utf8");
    })
    .join("\n");

  const targetText = check.targets
    .map((file) => {
      const path = resolve(root, file);
      if (!existsSync(path)) {
        failures.push(`${check.name}: missing implementation target ${file}`);
        return "";
      }
      return readFileSync(path, "utf8");
    })
    .join("\n");

  for (const token of check.required) {
    if (!sourceText.includes(token)) {
      failures.push(`${check.name}: OpenDesign source no longer contains ${token}`);
    }
    if (!targetText.includes(token)) {
      failures.push(`${check.name}: implementation does not contain ${token}`);
    }
  }

  for (const token of check.implementationOnly ?? []) {
    if (!targetText.includes(token)) {
      failures.push(`${check.name}: implementation does not contain ${token}`);
    }
  }
}

if (failures.length) {
  console.error("OpenDesign source-structure comparison failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`OpenDesign source-structure comparison passed for ${checks.length} surfaces.`);
