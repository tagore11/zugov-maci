import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCredentialScan } from "./useCredentialScan";

const zuAuthPopupMock = vi.fn();
vi.mock("@pcd/zuauth", () => ({
  zuAuthPopup: (...args: unknown[]) => zuAuthPopupMock(...args),
  ETHBERLIN04: [],
}));

const listMock = vi.fn();
const verifyMock = vi.fn();
vi.mock("@/src/services/credentialApi", () => ({
  list: (...args: unknown[]) => listMock(...args),
  verify: (...args: unknown[]) => verifyMock(...args),
}));

// /plan-eng-review (2026-08-23) Batch 4 -- this hook now calls useSiwe() for withAuthDetect.
// Mocking the module directly (matching JoinSection.test.tsx's convention), not wrapping in a
// real SiweProvider -- no test here exercises SiweProvider's own state machine.
const mockSignOut = vi.fn();
vi.mock("@/src/hooks/useSiwe", () => ({
  useSiwe: () => ({ signOut: mockSignOut }),
}));

const WALLET_ADDRESS = "0x1234567890123456789012345678901234567890";

beforeEach(() => {
  zuAuthPopupMock.mockReset();
  listMock.mockReset();
  verifyMock.mockReset();
  mockSignOut.mockReset();
  localStorage.clear();
  listMock.mockResolvedValue([]);
});

describe("useCredentialScan", () => {
  it("scan() populates zupass on success while zkid stays unset when no local credential exists", async () => {
    zuAuthPopupMock.mockResolvedValue({ type: "pcd", pcdStr: "mock-pcd-string" });
    verifyMock.mockResolvedValue({ protocol: "zupass", status: "verified", lastCheckedAt: 111 });
    // No zkID credential in localStorage — checkZkid short-circuits to null without
    // ever touching the (WASM-dependent) openac-sdk calls.

    const { result } = renderHook(() => useCredentialScan(WALLET_ADDRESS));

    await act(async () => {
      await result.current.scan();
    });

    await waitFor(() => {
      expect(result.current.credentials.zupass).toEqual({
        protocol: "zupass",
        status: "verified",
        lastCheckedAt: 111,
      });
    });
    expect(result.current.credentials.zkid).toBeUndefined();
    expect(verifyMock).toHaveBeenCalledWith("zupass", "mock-pcd-string");
    expect(verifyMock).not.toHaveBeenCalledWith("zkid", expect.anything());
  });

  it("does not let a popupClosed zupass result crash the scan or set a credential", async () => {
    zuAuthPopupMock.mockResolvedValue({ type: "popupClosed" });

    const { result } = renderHook(() => useCredentialScan(WALLET_ADDRESS));

    await act(async () => {
      await result.current.scan();
    });

    expect(result.current.credentials.zupass).toBeUndefined();
    expect(verifyMock).not.toHaveBeenCalled();
    expect(result.current.isScanning).toBe(false);
  });

  it("recheck() updates only the targeted protocol, leaving the other untouched", async () => {
    zuAuthPopupMock.mockResolvedValue({ type: "pcd", pcdStr: "first-pcd" });
    verifyMock.mockResolvedValueOnce({ protocol: "zupass", status: "verified", lastCheckedAt: 1 });

    const { result } = renderHook(() => useCredentialScan(WALLET_ADDRESS));

    await act(async () => {
      await result.current.scan();
    });
    expect(result.current.credentials.zupass?.status).toBe("verified");
    expect(result.current.credentials.zkid).toBeUndefined();

    zuAuthPopupMock.mockResolvedValue({ type: "pcd", pcdStr: "second-pcd" });
    verifyMock.mockResolvedValueOnce({ protocol: "zupass", status: "expired", lastCheckedAt: 2 });

    await act(async () => {
      await result.current.recheck("zupass");
    });

    expect(result.current.credentials.zupass).toEqual({
      protocol: "zupass",
      status: "expired",
      lastCheckedAt: 2,
    });
    // zkid was never targeted by recheck, so it must remain untouched.
    expect(result.current.credentials.zkid).toBeUndefined();
  });

  it("clears previous results the instant the wallet address changes", async () => {
    zuAuthPopupMock.mockResolvedValue({ type: "pcd", pcdStr: "first-pcd" });
    verifyMock.mockResolvedValueOnce({ protocol: "zupass", status: "verified", lastCheckedAt: 1 });

    const { result, rerender } = renderHook(({ address }) => useCredentialScan(address), {
      initialProps: { address: WALLET_ADDRESS },
    });

    await act(async () => {
      await result.current.scan();
    });
    expect(result.current.credentials.zupass?.status).toBe("verified");

    // Switch to a different wallet — must not still show the previous wallet's "verified"
    // status, even before the new wallet's own scan/loadStoredOnly resolves (spec.md FR-007).
    const OTHER_WALLET = "0x9999999999999999999999999999999999999999";
    rerender({ address: OTHER_WALLET });

    expect(result.current.credentials.zupass).toBeUndefined();
    expect(result.current.credentials.zkid).toBeUndefined();
  });

  it("surfaces a check failure via checkErrors instead of silently treating it as unverified", async () => {
    zuAuthPopupMock.mockRejectedValue(new Error("zupass service unreachable"));

    const { result } = renderHook(() => useCredentialScan(WALLET_ADDRESS));

    await act(async () => {
      await result.current.scan();
    });

    expect(result.current.credentials.zupass).toBeUndefined();
    expect(result.current.checkErrors.zupass).toBe("zupass service unreachable");
  });

  // /plan-eng-review (2026-08-23) Batch 4
  it("signs the wallet out when verify fails with an expired session (401)", async () => {
    const { HttpError } = await import("@/src/services/httpClient");
    zuAuthPopupMock.mockResolvedValue({ type: "pcd", pcdStr: "mock-pcd-string" });
    verifyMock.mockRejectedValue(new HttpError(401, "Authentication required. Please sign in with Ethereum."));

    const { result } = renderHook(() => useCredentialScan(WALLET_ADDRESS));

    await act(async () => {
      await result.current.scan();
    });

    expect(result.current.checkErrors.zupass).toBe("Authentication required. Please sign in with Ethereum.");
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("clears a previous check failure once a later check succeeds", async () => {
    zuAuthPopupMock.mockRejectedValueOnce(new Error("zupass service unreachable"));

    const { result } = renderHook(() => useCredentialScan(WALLET_ADDRESS));
    await act(async () => {
      await result.current.scan();
    });
    expect(result.current.checkErrors.zupass).toBe("zupass service unreachable");

    zuAuthPopupMock.mockResolvedValueOnce({ type: "pcd", pcdStr: "second-pcd" });
    verifyMock.mockResolvedValueOnce({ protocol: "zupass", status: "verified", lastCheckedAt: 1 });
    await act(async () => {
      await result.current.recheck("zupass");
    });

    expect(result.current.checkErrors.zupass).toBeUndefined();
    expect(result.current.credentials.zupass?.status).toBe("verified");
  });

  it("loadStoredOnly() reflects stored state without triggering any popup", async () => {
    listMock.mockResolvedValue([
      { protocol: "zupass", status: "verified", lastCheckedAt: 100 },
      { protocol: "zkid", status: "unverified", lastCheckedAt: null },
    ]);

    const { result } = renderHook(() => useCredentialScan(WALLET_ADDRESS));

    await act(async () => {
      await result.current.loadStoredOnly();
    });

    expect(result.current.credentials.zupass?.status).toBe("verified");
    expect(result.current.credentials.zkid?.status).toBe("unverified");
    expect(zuAuthPopupMock).not.toHaveBeenCalled();
  });
});
