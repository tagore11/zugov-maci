import { parseErrorOr } from "@/src/services/httpClient";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export type Protocol = "zupass" | "zkid";
export type CredentialStatus = "verified" | "unverified" | "expired";

export type CredentialResult = {
  protocol: Protocol;
  status: CredentialStatus;
  lastCheckedAt: number | null;
};

export async function list(): Promise<CredentialResult[]> {
  const res = await fetch(`${BASE_URL}/api/credentials`, { credentials: "include" });
  const data = await parseErrorOr<{ credentials: CredentialResult[] }>(
    res,
    `Failed to fetch credentials: ${res.status}`,
  );
  return data.credentials;
}

export async function verify(protocol: Protocol, proofPayload: unknown): Promise<CredentialResult> {
  const res = await fetch(`${BASE_URL}/api/credentials/${protocol}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(proofPayload),
  });
  return parseErrorOr(res, `Verification failed: ${res.status}`);
}
