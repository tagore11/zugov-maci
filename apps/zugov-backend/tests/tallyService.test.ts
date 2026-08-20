import { describe, it, expect } from "vitest";
import { resolveElectionWinner } from "../src/services/tallyService.js";

const CANDIDATE_A = "0x1111111111111111111111111111111111111a";
const CANDIDATE_B = "0x2222222222222222222222222222222222222b";
const CANDIDATE_C = "0x3333333333333333333333333333333333333c";

// Governance restructure Phase 2 (2026-08-20) — resolveElectionWinner is the only piece of the
// tally pipeline this phase adds; runTallyInBackground itself requires a real coordinator + MACI
// contract to exercise end-to-end, which no existing test in this file (there wasn't one) sets
// up. Direct unit coverage of the pure winner-resolution logic instead.
describe("resolveElectionWinner", () => {
  it("returns the candidate address for the option with the most votes", () => {
    const tallyData = { results: { tally: ["3", "10", "1"] } };
    const winner = resolveElectionWinner(tallyData, [CANDIDATE_A, CANDIDATE_B, CANDIDATE_C]);
    expect(winner).toBe(CANDIDATE_B);
  });

  it("returns null on a tie between two options", () => {
    const tallyData = { results: { tally: ["5", "5", "1"] } };
    const winner = resolveElectionWinner(tallyData, [CANDIDATE_A, CANDIDATE_B, CANDIDATE_C]);
    expect(winner).toBeNull();
  });

  it("returns null when nobody voted (every option tallies zero — a tie at 0)", () => {
    const tallyData = { results: { tally: ["0", "0", "0"] } };
    const winner = resolveElectionWinner(tallyData, [CANDIDATE_A, CANDIDATE_B, CANDIDATE_C]);
    expect(winner).toBeNull();
  });

  it("returns null when tallyData is missing the expected shape", () => {
    expect(resolveElectionWinner(undefined, [CANDIDATE_A, CANDIDATE_B])).toBeNull();
    expect(resolveElectionWinner({}, [CANDIDATE_A, CANDIDATE_B])).toBeNull();
    expect(resolveElectionWinner({ results: {} }, [CANDIDATE_A, CANDIDATE_B])).toBeNull();
  });

  it("returns null when the tally array length doesn't match optionMemberAddresses (defensive mismatch guard)", () => {
    const tallyData = { results: { tally: ["1", "2", "3"] } };
    const winner = resolveElectionWinner(tallyData, [CANDIDATE_A, CANDIDATE_B]);
    expect(winner).toBeNull();
  });

  it("handles large vote counts correctly (BigInt, not Number, comparison)", () => {
    const tallyData = { results: { tally: ["9007199254740993", "9007199254740992"] } };
    const winner = resolveElectionWinner(tallyData, [CANDIDATE_A, CANDIDATE_B]);
    expect(winner).toBe(CANDIDATE_A);
  });
});
