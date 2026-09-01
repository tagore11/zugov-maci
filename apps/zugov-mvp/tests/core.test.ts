import { describe, expect, it } from "vitest";
import { decide, analyseSensitivity, UnconfirmedPreferenceError } from "../lib/core/decide";
import { getMechanism, MECHANISM_ORDER } from "../lib/core/mechanisms";
import type { Option, PreferenceVector, Stance } from "../lib/core/types";
import { heuristicStances } from "../lib/llm/elicit";
import { heuristicGrounding } from "../lib/llm/grounding";

const options: Option[] = [
  { id: "s1", label: "Ortak mutfak" },
  { id: "s2", label: "Sessiz çalışma odası" },
  { id: "s3", label: "Açık atölye" },
];

function vector(subjectId: string, stances: Array<Partial<Stance> & { optionId: string }>): PreferenceVector {
  return {
    subjectId,
    decisionId: "k1",
    source: "form",
    createdAt: "2026-08-30T00:00:00.000Z",
    confirmed: true,
    stances: options.map((o) => {
      const given = stances.find((s) => s.optionId === o.id);
      return {
        optionId: o.id,
        support: given?.support ?? 0,
        confidence: given?.confidence ?? 0.5,
        salience: given?.salience ?? 0.5,
        redLine: given?.redLine ?? false,
      };
    }),
  };
}

describe("tally gate", () => {
  it("refuses to count a preference no human confirmed", () => {
    const draft = { ...vector("deniz", [{ optionId: "s1", support: 1 }]), confirmed: false };
    expect(() => decide([draft], options, "approval")).toThrow(UnconfirmedPreferenceError);
  });

  it("counts confirmed preferences", () => {
    const outcome = decide([vector("deniz", [{ optionId: "s1", support: 1 }])], options, "approval");
    expect(outcome.winnerId).toBe("s1");
  });
});

describe("one preference, every mechanism", () => {
  const people = [
    vector("deniz", [{ optionId: "s1", support: 1, salience: 1 }, { optionId: "s2", support: 0.5 }]),
    vector("ece", [{ optionId: "s2", support: 1, salience: 1 }, { optionId: "s1", support: 0.5 }]),
    vector("mert", [{ optionId: "s2", support: 0.5 }, { optionId: "s3", support: 1, salience: 1 }]),
  ];

  it("projects the same vector into every mechanism without loss of identity", () => {
    for (const id of MECHANISM_ORDER) {
      const outcome = decide(people, options, id);
      expect(outcome.mechanismId).toBe(id);
      expect(outcome.participantCount).toBe(3);
      expect(outcome.scores).toHaveLength(options.length);
    }
  });

  it("produces a human explanation for every ballot", () => {
    for (const id of MECHANISM_ORDER) {
      const mechanism = getMechanism(id);
      const lines = mechanism.explain(mechanism.project(people[0], options), options);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.join(" ")).not.toContain("undefined");
    }
  });

  it("keeps quadratic credits within the budget", () => {
    const ballot = getMechanism("quadratic").project(people[0], options);
    const spent = Object.values(ballot.shape.credits as Record<string, number>).reduce(
      (acc, c) => acc + Math.abs(c),
      0,
    );
    expect(spent).toBeLessThanOrEqual(100.01);
  });
});

describe("red lines", () => {
  it("survives every mechanism and reaches the outcome", () => {
    const people = [
      vector("deniz", [{ optionId: "s1", support: 1 }, { optionId: "s3", support: -1, redLine: true }]),
      vector("ece", [{ optionId: "s1", support: 1 }]),
    ];
    for (const id of MECHANISM_ORDER) {
      const outcome = decide(people, options, id);
      expect(outcome.redLines).toEqual([{ optionId: "s3", count: 1 }]);
    }
  });

  it("makes consent prefer the least objectionable option, not the most loved", () => {
    const people = [
      // s2 is nobody's favourite and nobody's objection: the classic consent winner.
      vector("a", [{ optionId: "s1", support: 1 }, { optionId: "s2", support: 0.1 }, { optionId: "s3", support: -1 }]),
      vector("b", [{ optionId: "s1", support: 1 }, { optionId: "s2", support: 0.1 }, { optionId: "s3", support: -1 }]),
      vector("c", [{ optionId: "s1", support: -1, redLine: true }, { optionId: "s2", support: 0.3 }, { optionId: "s3", support: 1 }]),
    ];
    expect(decide(people, options, "approval").winnerId).toBe("s1");
    expect(decide(people, options, "consent").winnerId).toBe("s2");
  });
});

describe("mechanism sensitivity", () => {
  it("reports robust when every mechanism agrees", () => {
    const people = [
      vector("a", [{ optionId: "s1", support: 1, salience: 1 }]),
      vector("b", [{ optionId: "s1", support: 1, salience: 1 }]),
    ];
    const report = analyseSensitivity(people, options);
    expect(report.distinctWinners).toEqual(["s1"]);
    expect(report.verdict).toBe("robust");
  });

  it("flags a result the rule is deciding", () => {
    const people = [
      vector("a", [{ optionId: "s1", support: 1 }, { optionId: "s2", support: 0.3 }, { optionId: "s3", support: -1, redLine: true }]),
      vector("b", [{ optionId: "s1", support: 1 }, { optionId: "s2", support: 0.3 }, { optionId: "s3", support: -1, redLine: true }]),
      vector("c", [{ optionId: "s3", support: 1, salience: 1 }, { optionId: "s1", support: -1, redLine: true }]),
      vector("d", [{ optionId: "s3", support: 1, salience: 1 }, { optionId: "s1", support: -1, redLine: true }]),
    ];
    const report = analyseSensitivity(people, options);
    expect(report.distinctWinners.length).toBeGreaterThan(1);
    expect(report.verdict).not.toBe("robust");
  });
});

describe("model-free fallbacks", () => {
  it("elicits something usable without a model", () => {
    const drafted = heuristicStances("ortak mutfak kesinlikle olsun ama sessiz oda istemiyorum", options);
    expect(drafted.find((s) => s.optionId === "s1")!.support).toBeGreaterThan(0);
    expect(drafted.find((s) => s.optionId === "s2")!.support).toBeLessThan(0);
  });

  it("grounds a proposal without a model and stays neutral", () => {
    const report = heuristicGrounding({
      decisionId: "k1",
      title: "Ortak alan bütçesi",
      body: "Ortak alan bütçesinin yarısını mutfağa ayırmayı öneriyoruz. Atölye için yer kalmayabilir.",
      options: options.map((o) => ({ id: o.id, label: o.label })),
    });
    expect(report.assumptions?.length).toBeGreaterThan(0);
    expect(JSON.stringify(report)).not.toMatch(/öneriyorum|en iyisi|kabul edilmeli/i);
  });
});

describe("grounding guards", () => {
  it("drops observations carrying figures the proposal never stated", async () => {
    const { groundProposal } = await import("../lib/llm/grounding");
    const input = {
      decisionId: "k1",
      title: "Ortak alan bütçesi",
      body: "12 gün için 40 bin lira var ve üç talep geldi.",
      options: options.map((o) => ({ id: o.id, label: o.label })),
    };
    // No model reachable in CI: the deterministic path runs and must stay clean.
    const report = await groundProposal({ ...input });
    const printed = [report.crux, ...Object.values(report.tradeoffs)];
    for (const observation of printed) {
      for (const match of observation.match(/\d[\d.,]*/g) ?? []) {
        expect(input.body.replace(/[.,\s]/g, "")).toContain(match.replace(/[.,]/g, ""));
      }
    }
    // The default pass says one thing, not eighteen.
    expect(report.sections).toBeNull();
    expect(report.crux.split(/\s+/).length).toBeLessThanOrEqual(30);
  });
});

describe("elicitation", () => {
  const answer = (etiket: string, onem: string, kirmizi = false) => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify({ alinti: "", etiket, onem, kirmizi_cizgi: kirmizi }) } }] }),
  });

  it("maps enthusiasm to support and never inverts the sign", async () => {
    const { elicitPreference } = await import("../lib/llm/elicit");
    const replies = [
      answer("savunuyor", "belirleyici"),
      answer("kararsiz", "ikincil"),
      answer("reddediyor", "onemli", true),
    ];
    const original = globalThis.fetch;
    globalThis.fetch = (async () => replies.shift()) as unknown as typeof fetch;
    try {
      const result = await elicitPreference({ subjectId: "deniz", decisionId: "k1", text: "uzunca bir metin", options });
      const [mutfak, oda, atolye] = result.vector.stances;
      expect(mutfak.support).toBe(1);
      expect(mutfak.salience).toBe(1);
      expect(oda.support).toBe(0);
      expect(atolye.support).toBe(-1);
      expect(atolye.redLine).toBe(true);
      // The whole point: a model may draft, only a person may confirm.
      expect(result.vector.confirmed).toBe(false);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("falls back to the keyword path when no model answers", async () => {
    const { elicitPreference } = await import("../lib/llm/elicit");
    const result = await elicitPreference({
      subjectId: "ece",
      decisionId: "k1",
      text: "ortak mutfak kesinlikle olsun, sessiz oda istemiyorum",
      options,
    });
    expect(result.producedBy).toContain("heuristic");
    expect(result.vector.confirmed).toBe(false);
  });
});

describe("question selection", () => {
  const base = {
    decisionId: "k1",
    title: "Ortak alan",
    options: [
      { id: "s1", label: "Mutfak" },
      { id: "s2", label: "Oda" },
    ],
  };

  it("asks only what a plain proposal earns", async () => {
    const { questionsFor } = await import("../lib/llm/grounding");
    const asked = questionsFor({ ...base, body: "Ne yapalım bilmiyoruz." });
    expect(asked).toEqual(["assumptions", "counterarguments", "precedents"]);
    expect(asked.length).toBeGreaterThanOrEqual(3);
  });

  it("adds base rates when the text makes a numeric claim", async () => {
    const { questionsFor } = await import("../lib/llm/grounding");
    expect(questionsFor({ ...base, body: "40 bin lira var." })).toContain("baseRates");
  });

  it("adds reversibility when the text describes committing to something", async () => {
    const { questionsFor } = await import("../lib/llm/grounding");
    expect(questionsFor({ ...base, body: "Bir yer kiralayacağız." })).toContain("reversibility");
  });

  it("does not ask for precedents when the text already cites one", async () => {
    const { questionsFor } = await import("../lib/llm/grounding");
    const asked = questionsFor({ ...base, body: "Geçen yıl da denedik." });
    expect(asked).not.toContain("precedents");
    // Dropping a question must not take the audit below its floor.
    expect(asked.length).toBe(3);
  });

  it("never asks more than six or fewer than three", async () => {
    const { questionsFor } = await import("../lib/llm/grounding");
    const busy = questionsFor({
      ...base,
      options: [...base.options, { id: "s3", label: "Atölye" }],
      body: "40 bin lira ile bir yer kiralayacağız, esnaf ve çalışanlar etkilenecek.",
    });
    expect(busy.length).toBeLessThanOrEqual(6);
    expect(busy.length).toBeGreaterThanOrEqual(3);
  });
});

describe("receipt", () => {
  const people = [
    vector("0xaaa", [{ optionId: "s1", support: 1, salience: 1 }, { optionId: "s3", support: -1, redLine: true }]),
    vector("0xbbb", [{ optionId: "s1", support: 1 }, { optionId: "s2", support: 1 }]),
    vector("0xccc", [{ optionId: "s2", support: 1, salience: 1 }]),
  ];

  const build = async () => {
    const { buildReceipt } = await import("../lib/core/receipt");
    return buildReceipt({
      decisionId: "k1",
      title: "Ortak alan bütçesi",
      options,
      mechanismId: "approval",
      preferences: people,
      salt: "tuz",
    });
  };

  it("recomputes to the same digest and the same result", async () => {
    const { verifyReceipt } = await import("../lib/core/receipt");
    const receipt = await build();
    const checked = verifyReceipt(receipt);
    expect(checked.digestMatches).toBe(true);
    expect(checked.tallyMatches).toBe(true);
    expect(checked.recomputed.winnerId).toBe(receipt.outcome.winnerId);
  });

  it("is byte-identical no matter what order the ballots arrived in", async () => {
    const { buildReceipt } = await import("../lib/core/receipt");
    const shuffled = buildReceipt({
      decisionId: "k1",
      title: "Ortak alan bütçesi",
      options: [...options].reverse(),
      mechanismId: "approval",
      preferences: [...people].reverse(),
      salt: "tuz",
    });
    expect(shuffled.digest).toBe((await build()).digest);
  });

  it("catches a result that was edited after the fact", async () => {
    const { verifyReceipt } = await import("../lib/core/receipt");
    const receipt = await build();
    const tampered = {
      ...receipt,
      outcome: { ...receipt.outcome, winnerId: "s3" },
    };
    const checked = verifyReceipt(tampered);
    expect(checked.digestMatches).toBe(false);
    expect(checked.tallyMatches).toBe(false);
  });

  it("catches a ballot added after the digest was taken", async () => {
    const { verifyReceipt } = await import("../lib/core/receipt");
    const receipt = await build();
    const stuffed = {
      ...receipt,
      ballots: [
        ...receipt.ballots,
        { voter: "ffffffffffffffff", stances: options.map((o) => ({ optionId: o.id, support: 1, salience: 1, redLine: false })) },
      ],
    };
    const checked = verifyReceipt(stuffed);
    expect(checked.digestMatches).toBe(false);
    expect(checked.tallyMatches).toBe(false);
  });

  it("names no voter", async () => {
    const receipt = await build();
    const printed = JSON.stringify(receipt);
    for (const person of people) expect(printed).not.toContain(person.subjectId);
  });

  it("lets a person find their own ballot and nobody build the list", async () => {
    const { createHash } = await import("node:crypto");
    const receipt = await build();
    const mine = createHash("sha256").update("tuz:0xaaa").digest("hex").slice(0, 16);
    expect(receipt.ballots.some((b) => b.voter === mine)).toBe(true);
    // The same wallet in a different decision hashes differently.
    const elsewhere = createHash("sha256").update("baskatuz:0xaaa").digest("hex").slice(0, 16);
    expect(receipt.ballots.some((b) => b.voter === elsewhere)).toBe(false);
  });
});
