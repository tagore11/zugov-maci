import { useCallback, useEffect, useState } from "react";
import { zuAuthPopup, ETHBERLIN04, type ZuAuthArgs } from "@pcd/zuauth";
import * as credentialApi from "@/src/services/credentialApi";
import type { CredentialResult, Protocol } from "@/src/services/credentialApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

/**
 * Placeholder ticket config — mirrors apps/zugov-backend's zupassAdapter.ts. ZuGov needs
 * its own registered Zupass Generic Issuance pipeline before this checks anything
 * ZuGov-specific (research.md #1). Swap both constants together once that pipeline exists.
 */
const ZUPASS_TICKET_CONFIG: ZuAuthArgs["config"] = ETHBERLIN04;

const ZKID_CREDENTIAL_STORAGE_KEY = "zugov:zkid-credential";

interface StoredZkidCredential {
  jwt: string;
  disclosures: string[];
  issuerPublicKey: { kty: "EC"; crv: "P-256"; x: string; y: string };
  devicePrivateKey: string;
}

function readStoredZkidCredential(): StoredZkidCredential | null {
  try {
    const raw = localStorage.getItem(ZKID_CREDENTIAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredZkidCredential) : null;
  } catch {
    return null;
  }
}

type CredentialsByProtocol = Partial<Record<Protocol, CredentialResult>>;
type CheckErrorsByProtocol = Partial<Record<Protocol, string>>;

function toMap(results: CredentialResult[]): CredentialsByProtocol {
  return Object.fromEntries(results.map((r) => [r.protocol, r]));
}

export function useCredentialScan(walletAddress: string | undefined) {
  const [credentials, setCredentials] = useState<CredentialsByProtocol>({});
  const [checkErrors, setCheckErrors] = useState<CheckErrorsByProtocol>({});
  const [isScanning, setIsScanning] = useState(false);
  const { signOut } = useSiwe();

  // Results are scoped strictly to the currently connected wallet (spec.md FR-007) — clear
  // them synchronously on address change so a previous wallet's status is never shown while
  // the new wallet's scan/loadStoredOnly call is still in flight.
  useEffect(() => {
    setCredentials({});
    setCheckErrors({});
  }, [walletAddress]);

  const checkZupass = useCallback(
    async (address: string): Promise<CredentialResult | null> => {
      const result = await zuAuthPopup({
        watermark: address,
        config: ZUPASS_TICKET_CONFIG,
        fieldsToReveal: {},
      });
      if (result.type !== "pcd") return null; // popupClosed/popupBlocked/aborted/multi-pcd/pendingPcd
      return withAuthDetect(() => credentialApi.verify("zupass", result.pcdStr), signOut);
    },
    [signOut],
  );

  const checkZkid = useCallback(async (_address: string): Promise<CredentialResult | null> => {
    const stored = readStoredZkidCredential();
    if (!stored) return null; // no zkID credential available client-side yet — genuinely unverified

    // Intentionally stubbed (2026-08-04, /speckit-implement): openac-sdk cannot be wired up
    // client-side yet for two confirmed, independent reasons — (1) its published package has
    // no working WASM proving/verification binary (OpenAC.init() throws WasmError at runtime;
    // needs a wasm-pack build the team hasn't done — research.md's zkID finding), and (2) even
    // importing it breaks this app's production Vite build (a node-stdlib-browser polyfill
    // incompatibility with the SDK's Node-fs-based default init path, confirmed by an actual
    // failed build). Once both are resolved, this should call openac-sdk's precompute()/
    // present() against `stored` and POST the result via credentialApi.verify("zkid", ...),
    // matching zkidAdapter.ts's server-side shape.
    //
    // A stored credential exists but can't actually be checked — this must surface as "check
    // failed" (via checkOne's catch below), not a silent, false "unverified" result (spec.md
    // edge case: "not a silent failure and not a false 'unverified'").
    throw new Error("zkID verification is temporarily unavailable in this build");
  }, []);

  const checkOne = useCallback(
    async (protocol: Protocol, address: string) => {
      try {
        const result = protocol === "zupass" ? await checkZupass(address) : await checkZkid(address);
        setCheckErrors((prev) => {
          if (!(protocol in prev)) return prev;
          const next = { ...prev };
          delete next[protocol];
          return next;
        });
        if (result) {
          setCredentials((prev) => ({ ...prev, [protocol]: result }));
        }
      } catch (err) {
        // A single protocol's failure never blocks the other or the caller (spec.md FR-003) —
        // but it must be visible as "check failed", not conflated with "not found" (spec.md
        // edge case: "the user must still see... a clear indication that the other check
        // could not be completed — not a silent failure and not a false 'unverified'").
        setCheckErrors((prev) => ({
          ...prev,
          [protocol]: err instanceof Error ? err.message : "Check failed",
        }));
      }
    },
    [checkZupass, checkZkid],
  );

  /** Reads currently stored status only — never triggers a popup/proof-generation flow. */
  const loadStoredOnly = useCallback(async () => {
    const stored = await credentialApi.list();
    setCredentials(toMap(stored));
  }, []);

  const scan = useCallback(async () => {
    if (!walletAddress) return;
    setIsScanning(true);
    try {
      await loadStoredOnly();
      await Promise.all([checkOne("zupass", walletAddress), checkOne("zkid", walletAddress)]);
    } finally {
      setIsScanning(false);
    }
  }, [walletAddress, checkOne, loadStoredOnly]);

  const recheck = useCallback(
    async (protocol: Protocol) => {
      if (!walletAddress) return;
      await checkOne(protocol, walletAddress);
    },
    [walletAddress, checkOne],
  );

  return { credentials, checkErrors, isScanning, scan, recheck, loadStoredOnly };
}
