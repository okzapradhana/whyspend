import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const sourceRoot = new URL("../src/", import.meta.url).pathname;
const files = [];
const failures = [];
const runtimeVariables = new Set(["slice-color", "value", "x", "y"]);
const approvedTypeValues = new Set(["12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px"]);
const approvedRadiusValues = new Set(["8px", "12px", "16px", "24px", "9999px"]);
const excludedLegacyColorFiles = new Set(["features/categories/categories.css"]);

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (/\.(css|ts|tsx)$/.test(entry.name)) files.push(path);
  }
}

await collect(sourceRoot);
const contents = new Map(await Promise.all(files.map(async (path) => [path, await readFile(path, "utf8")])));
const appCssPath = join(sourceRoot, "styles/app.css");
const appCss = contents.get(appCssPath);
if (!appCss) throw new Error("Could not read src/styles/app.css");

const rootMatch = appCss.match(/:root\s*\{([\s\S]*?)\n\}/);
if (!rootMatch) throw new Error("Could not find the root design-token block");
const rootBlock = rootMatch[1];
const rootTokens = new Map([...rootBlock.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)].map((match) => [match[1], match[2].trim()]));

for (const [name, value] of rootTokens) {
  if (name.startsWith("text-") && !approvedTypeValues.has(value)) {
    failures.push(`app.css: type token --${name} resolves to unauthorized value ${value}`);
  }
  if ((name === "radius" || name.startsWith("radius-")) && !approvedRadiusValues.has(value)) {
    failures.push(`app.css: radius token --${name} resolves to unauthorized value ${value}`);
  }
}

const colorLiteral = /#[0-9a-f]{3,8}\b|\boklch\(|\brgb\(|\bblack\b/gi;
const cssFiles = files.filter((path) => path.endsWith(".css"));
const scriptFiles = files.filter((path) => /\.(ts|tsx)$/.test(path));

for (const path of cssFiles) {
  const css = contents.get(path);
  const displayPath = relative(sourceRoot, path);

  for (const match of css.matchAll(/var\(--([a-z0-9-]+)/gi)) {
    if (!rootTokens.has(match[1]) && !runtimeVariables.has(match[1])) {
      failures.push(`${displayPath}: undefined or non-root CSS variable --${match[1]}`);
    }
  }

  const cssWithoutRootTokens = path === appCssPath ? css.replace(rootMatch[0], "") : css;
  if (!excludedLegacyColorFiles.has(displayPath) && colorLiteral.test(cssWithoutRootTokens)) {
    failures.push(`${displayPath}: colors outside :root must reference approved semantic tokens`);
  }
  colorLiteral.lastIndex = 0;

  for (const match of css.matchAll(/border-radius\s*:\s*([^;]+);/gi)) {
    const value = match[1].trim();
    if (value === "inherit") continue;
    const token = value.match(/^var\(--([a-z0-9-]+)\)$/i)?.[1];
    if (!token || !rootTokens.has(token) || !approvedRadiusValues.has(rootTokens.get(token))) {
      failures.push(`${displayPath}: unsupported border-radius ${value}`);
    }
  }

  for (const match of css.matchAll(/([^{}]+)\{[^{}]*font-size\s*:\s*([^;]+);/gi)) {
    const selector = match[1].trim().replace(/\s+/g, " ");
    const value = match[2].trim();
    if (selector === ":root") continue;
    const token = value.match(/^var\(--([a-z0-9-]+)\)$/i)?.[1];
    if (!token || !rootTokens.has(token) || !approvedTypeValues.has(rootTokens.get(token))) {
      failures.push(`${displayPath}: unsupported font-size ${value} in ${selector}`);
    }
  }
}

for (const path of scriptFiles) {
  const source = contents.get(path);
  const displayPath = relative(sourceRoot, path);

  for (const match of source.matchAll(/var\(--([a-z0-9-]+)/gi)) {
    if (!rootTokens.has(match[1]) && !runtimeVariables.has(match[1])) {
      failures.push(`${displayPath}: undefined or non-root CSS variable --${match[1]}`);
    }
  }

  if (colorLiteral.test(source)) {
    failures.push(`${displayPath}: inline styles and presentation attributes must reference approved semantic tokens`);
  }
  colorLiteral.lastIndex = 0;

  for (const match of source.matchAll(/(?:fontSize|borderRadius)\s*:\s*["'`]([^"'`]+)["'`]/g)) {
    const value = match[1];
    const token = value.match(/^var\(--([a-z0-9-]+)\)$/)?.[1];
    const approvedValues = match[0].startsWith("fontSize") ? approvedTypeValues : approvedRadiusValues;
    if (!token || !rootTokens.has(token) || !approvedValues.has(rootTokens.get(token))) {
      failures.push(`${displayPath}: unauthorized inline design value ${match[0]}`);
    }
  }
}

for (const selector of ["body", ".sidebar", ".page", ".page-header", ".surface", ".button", ".dialog"]) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const occurrences = [...appCss.matchAll(new RegExp(`(^|\\n)${escaped}\\s*\\{`, "g"))].length;
  if (occurrences > 1) failures.push(`app.css: duplicate core selector ${selector}`);
}

const visibleCopy = scriptFiles.filter((path) => path.endsWith(".tsx")).map((path) => contents.get(path)).join("\n");
if (/[—–]/u.test(visibleCopy)) failures.push("TSX source: visible copy contains a prohibited dash character");
for (const staleCopy of [
  "Add Transaction", "Edit Transaction", "Savings Goals", "Total Savings Progress",
  "Total Income", "Total Expenses", "Net Savings", "Create Account", "Welcome Back",
  "Display Name", "Email Address", "Sign In", "OR SIGN UP WITH"
]) {
  if (visibleCopy.includes(staleCopy)) failures.push(`TSX source: stale non-sentence-case copy ${JSON.stringify(staleCopy)}`);
}

if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exit(1);
}

console.log(`Design-system validation passed across ${cssFiles.length} stylesheets and ${scriptFiles.length} TypeScript files.`);
