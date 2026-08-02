import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const openDesignRoot =
  "/Users/okzapradhana/Library/Application Support/Open Design/namespaces/release-stable/data/projects/99cd9d7c-81ce-4fbf-8d14-948326aaeac0";

const files = {
  openDesignCss: resolve(openDesignRoot, "assets/app.css"),
  designMd: resolve("DESIGN.md"),
  appCss: resolve("src/styles/app.css")
};

const requiredTokens = {
  "--bg": "#fbf9f8",
  "--surface": "#ffffff",
  "--surface-container-low": "#f5f3f3",
  "--surface-container": "#efeded",
  "--fg": "#1b1c1c",
  "--fg-2": "#424941",
  "--muted": "#727970",
  "--border": "#c2c8be",
  "--accent": "#416743",
  "--accent-on": "#ffffff",
  "--accent-soft": "#c2eec0",
  "--accent-mid": "#7da67d",
  "--secondary": "#406373",
  "--secondary-soft": "#c3e8fb",
  "--tertiary": "#615e57",
  "--tertiary-soft": "#e8e2d9",
  "--danger": "#ba1a1a",
  "--danger-soft": "#ffdad6"
};

function read(path) {
  return readFileSync(path, "utf8").toLowerCase();
}

const sources = Object.fromEntries(Object.entries(files).map(([key, path]) => [key, read(path)]));
const failures = [];

for (const [token, value] of Object.entries(requiredTokens)) {
  if (!sources.openDesignCss.includes(`${token}: ${value}`)) {
    failures.push(`OpenDesign CSS missing ${token}: ${value}`);
  }
  if (!sources.appCss.includes(`${token}: ${value}`)) {
    failures.push(`app.css missing ${token}: ${value}`);
  }
  if (!sources.designMd.includes(value)) {
    failures.push(`DESIGN.md missing ${value} for ${token}`);
  }
}

if (failures.length) {
  console.error(`Token parity failed (${failures.length} mismatches):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Token parity passed for ${Object.keys(requiredTokens).length} OpenDesign tokens.`);
