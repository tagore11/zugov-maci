import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * DESIGN-RULES.md, enforced.
 *
 * A style rule that lives only in a document is a suggestion. These are the
 * ones cheap enough to check mechanically, so they are checked.
 */

const ROOT = join(__dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".data", ".git", "tests"]);

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sourceFiles(path, acc);
    else if (/\.(ts|tsx|css|md|Modelfile)$/.test(entry)) acc.push(path);
  }
  return acc;
}

const FILES = sourceFiles(ROOT).map((path) => ({
  path: path.slice(ROOT.length + 1),
  text: readFileSync(path, "utf8"),
}));

/** DESIGN-RULES.md itself names the banned things, so it cannot be its own witness. */
const CODE = FILES.filter((file) => file.path !== "DESIGN-RULES.md");

describe("design rules", () => {
  it("contains no em dash or en dash anywhere", () => {
    const offenders = CODE.filter((file) => /[–—]/.test(file.text)).map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it("loads no banned typeface", () => {
    const banned = [
      "Space_Grotesk", "Space Grotesk", "Outfit", "Satoshi", "Cabinet Grotesk",
      "Fraunces", "Instrument_Serif", "Instrument Serif", "Sora", "Manrope",
      "Poppins", "Clash Display",
    ];
    const offenders = CODE.flatMap((file) =>
      banned.filter((font) => file.text.includes(font)).map((font) => `${file.path}: ${font}`),
    );
    expect(offenders).toEqual([]);
  });

  it("uses no colour from a banned palette family", () => {
    const banned = ["#faf6f0", "#f5f1ea", "#faf7f1", "#fbf8f1", "#b4552c", "#c1633b", "#b08947", "#9c4a28"];
    const offenders = CODE.flatMap((file) =>
      banned.filter((hex) => file.text.toLowerCase().includes(hex)).map((hex) => `${file.path}: ${hex}`),
    );
    expect(offenders).toEqual([]);
  });

  it("keeps every hex colour achromatic, apart from the one permitted red", () => {
    const allowedChromatic = new Set(["#da1e28", "#fa4d56", "#ff8389"]);
    const offenders: string[] = [];

    for (const file of CODE) {
      for (const match of file.text.match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
        const hex = match.toLowerCase();
        if (allowedChromatic.has(hex)) continue;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const spread = Math.max(r, g, b) - Math.min(r, g, b);
        // 6/255 of drift is rounding in a grey ramp, not a hue.
        if (spread > 6) offenders.push(`${file.path}: ${hex}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("never uses pure black or pure white as ink", () => {
    const offenders = CODE.filter((file) => /color:\s*#(000000|fff(fff)?)\b/i.test(file.text)).map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it("keeps one corner radius", () => {
    const radii = new Set<string>();
    for (const file of CODE) {
      for (const match of file.text.match(/rounded-\[(\d+)px\]/g) ?? []) radii.add(match);
    }
    expect([...radii].length).toBeLessThanOrEqual(1);
  });

  /**
   * Turkish copy rules from the turkce-humanizer standard, applied to every
   * string literal that actually carries Turkish text. These three are the
   * clearest signatures of English syntax forced onto Turkish, and all three
   * had crept into the interface copy.
   */
  describe("Turkish copy", () => {
    const turkishStrings = CODE.filter((file) => /\.tsx?$/.test(file.path)).flatMap((file) =>
      (file.text.match(/"[^"\n]{12,}"/g) ?? [])
        .map((literal) => literal.slice(1, -1))
        .filter((text) => /[çğıöşüÇĞİÖŞÜ]/.test(text))
        .map((text) => ({ path: file.path, text })),
    );

    it("finds Turkish copy to check", () => {
      expect(turkishStrings.length).toBeGreaterThan(20);
    });

    it("puts no comma before an adversative conjunction", () => {
      const offenders = turkishStrings
        .filter((s) => /,\s+(ama|ancak|fakat|lakin)\s/.test(s.text))
        .map((s) => `${s.path}: ${s.text}`);
      expect(offenders).toEqual([]);
    });

    it("uses no semicolon", () => {
      const offenders = turkishStrings.filter((s) => s.text.includes(";")).map((s) => `${s.path}: ${s.text}`);
      expect(offenders).toEqual([]);
    });

    it("does not use the \"not X, but Y\" construction", () => {
      const offenders = turkishStrings
        .filter((s) => /\sdeğil,\s/.test(s.text))
        .map((s) => `${s.path}: ${s.text}`);
      expect(offenders).toEqual([]);
    });
  });

  it("does not break a headline with <br>", () => {
    /* The rule is about markup. Prose that names the rule is not markup. */
    const offenders = CODE.filter(
      (file) => /\.(ts|tsx|css)$/.test(file.path) && /<br\s*\/?>/.test(file.text),
    ).map((f) => f.path);
    expect(offenders).toEqual([]);
  });
});

/**
 * EIP-4361 restricts a sign-in message's statement to reserved and unreserved
 * characters. A Turkish diacritic in there made the backend reject every login
 * with "Invalid SIWE message format", and made the wallet drop its recognisable
 * sign-in screen in favour of raw text. Both failures are silent until someone
 * tries to log in, so the constraint is checked here instead.
 */
describe("sign-in message", () => {
  it("keeps the SIWE statement inside the character set the spec allows", async () => {
    const { SIWE_STATEMENT } = await import("../lib/session");
    expect(SIWE_STATEMENT).toMatch(/^[\x20-\x7E]+$/);
    expect(SIWE_STATEMENT).not.toContain("\n");
  });
});
