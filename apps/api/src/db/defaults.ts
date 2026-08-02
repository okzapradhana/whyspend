export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", scope: "both" },
  { name: "Freelance", scope: "member" },
  { name: "Bonus", scope: "member" },
  { name: "Other Income", scope: "both" }
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Subscription", scope: "member" },
  { name: "Entertainment", scope: "member" },
  { name: "Sedekah", scope: "member" },
  { name: "Paket data", scope: "member" },
  { name: "Transport (member parking)", scope: "member" },
  { name: "Transport (e-money)", scope: "member" },
  { name: "Transport (bensin)", scope: "member" },
  { name: "Skincare", scope: "member" },
  { name: "Shopping", scope: "member" },
  { name: "Treats", scope: "member" },
  { name: "Holiday", scope: "member" },
  { name: "Gift", scope: "member" },
  { name: "Family needs", scope: "member" },
  { name: "Others", scope: "member" },
  { name: "Health", scope: "member" },
  { name: "Kebutuhan Dapur", scope: "both" },
  { name: "Household", scope: "both" },
  { name: "Sport", scope: "member" },
  { name: "WiFi", scope: "both" },
  { name: "Electricity", scope: "both" },
  { name: "Home Maintenance", scope: "both" },
  { name: "Gas & Air", scope: "both" }
] as const;

export const DEFAULT_SAVINGS_GOALS = [
  { name: "Emergency Fund", targetAmount: 50_000_000, startingAmount: 10_000_000, targetDate: "2024-12-31" },
  { name: "Japan Trip 2026", targetAmount: 45_000_000, startingAmount: 15_000_000, targetDate: "2026-08-31" },
  { name: "DP Rumah", targetAmount: 100_000_000, startingAmount: 25_000_000, targetDate: "2026-06-30" },
  { name: "New Handphone", targetAmount: 15_000_000, startingAmount: 5_000_000, targetDate: "2024-10-31" }
] as const;
