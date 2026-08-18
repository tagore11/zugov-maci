import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSignerFromWalletClient, getSignerFromWagmiConfig } from "./wagmiSigner";

// Regression test for a critical bug found in eng review: useSignup.ts, useVote.ts,
// useDeployPoll.ts, and useCreateCommunity.ts all used to read window.ethereum directly to get
// a signer. Privy embedded wallets (the whole point of the wallet-custody work — non-crypto
// residents signing in by email) are NOT injected as window.ethereum; that global is reserved
// for browser-extension wallets like MetaMask. So every one of those flows silently threw
// "No wallet found" for exactly the population they were built for. These tests prove the fix
// works with window.ethereum entirely absent.
const FAKE_ADDRESS = "0x1111111111111111111111111111111111111111";

describe("getSignerFromWalletClient — works without window.ethereum", () => {
  beforeEach(() => {
    // Explicitly confirm the environment has no injected wallet — this is exactly the
    // real-world state for an embedded-wallet resident with no browser extension installed.
    expect((globalThis as { ethereum?: unknown }).ethereum).toBeUndefined();
  });

  it("builds a signer from a wagmi walletClient with no window.ethereum present", () => {
    const fakeWalletClient = {
      account: { address: FAKE_ADDRESS },
      transport: { request: vi.fn() },
    };

    // @ts-expect-error — minimal fake shape, not a full viem Client
    const signer = getSignerFromWalletClient(fakeWalletClient);

    expect(signer.address).toBe(FAKE_ADDRESS);
  });

  it("throws a clear error (not a crash) when no wallet is connected at all", () => {
    expect(() => getSignerFromWalletClient(undefined)).toThrow("No wallet found");
  });

  it("throws a clear error when the walletClient has no account", () => {
    // @ts-expect-error — minimal fake shape
    expect(() => getSignerFromWalletClient({ transport: {} })).toThrow("No wallet found");
  });
});

describe("getSignerFromWagmiConfig — module-level (non-hook) signer access", () => {
  afterEach(() => {
    vi.doUnmock("wagmi/actions");
  });

  it("resolves a signer via wagmi/actions' getWalletClient, not window.ethereum", async () => {
    vi.doMock("wagmi/actions", () => ({
      getWalletClient: vi.fn().mockResolvedValue({
        account: { address: FAKE_ADDRESS },
        transport: { request: vi.fn() },
      }),
    }));
    vi.resetModules();
    const { getSignerFromWagmiConfig: freshGetSigner } = await import("./wagmiSigner");

    // @ts-expect-error — fake Config, only used as an opaque token passed through to the mock
    const signer = await freshGetSigner({});

    expect(signer.address).toBe(FAKE_ADDRESS);
  });
});
