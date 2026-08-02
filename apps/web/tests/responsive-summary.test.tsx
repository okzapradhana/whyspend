import { describe, expect, it } from "vitest";
import "../src/styles/app.css";
import "../src/features/summaries/summaries.css";

describe("responsive summary styles", () => {
  it("contains mobile and desktop grid rules for summary layout", () => {
    const styleSheets = Array.from(document.styleSheets);
    const cssText = styleSheets.map((sheet) => Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n")).join("\n");
    expect(cssText).toContain(".summary-grid");
    expect(cssText).toContain(".pie-svg");
    expect(cssText).toContain(".detailed-trend");
    expect(cssText).toContain("@media (max-width: 940px)");
  });
});
