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
  if (!res.ok) throw new Error(`Failed to fetch credentials: ${res.status}`);
  const data = (await res.json()) as { credentials: CredentialResult[] };
  return data.credentials;
}

export async function verify(protocol: Protocol, proofPayload: unknown): Promise<CredentialResult> {
  const res = await fetch(`${BASE_URL}/api/credentials/${protocol}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(proofPayload),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error: string };
    throw new Error(data.error ?? `Verification failed: ${res.status}`);
  }
  return res.json() as Promise<CredentialResult>;
}
