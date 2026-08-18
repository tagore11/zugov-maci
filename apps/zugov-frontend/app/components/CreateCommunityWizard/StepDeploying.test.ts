import { describe, it, expect } from "vitest";
import { getBlockExplorerTxUrl } from "./StepDeploying";

const TX_HASH = "0xabc123";

describe("getBlockExplorerTxUrl", () => {
  it("links to Sepolia Etherscan for chainId 11155111 (the chain locked in for Zukas 2026)", () => {
    expect(getBlockExplorerTxUrl(TX_HASH, 11155111)).toBe("https://sepolia.etherscan.io/tx/0xabc123");
  });

  it("links to Scroll Sepolia's own explorer for chainId 534351", () => {
    expect(getBlockExplorerTxUrl(TX_HASH, 534351)).toBe("https://sepolia.scrollscan.com/tx/0xabc123");
  });

  it("falls back to etherscan.io for an unrecognized or missing chainId, rather than guessing", () => {
    expect(getBlockExplorerTxUrl(TX_HASH, 999999)).toBe("https://etherscan.io/tx/0xabc123");
    expect(getBlockExplorerTxUrl(TX_HASH, undefined)).toBe("https://etherscan.io/tx/0xabc123");
  });

  it("regression: Sepolia never resolves to a Scroll explorer URL", () => {
    expect(getBlockExplorerTxUrl(TX_HASH, 11155111)).not.toContain("scrollscan.com");
  });
});
