import { Interface } from "ethers";
import {
  MACI_ABI,
  POLL_ABI,
  BASE_POLICY_ABI,
  BASE_CHECKER_ABI,
  FREE_FOR_ALL_POLICY_ABI,
  FREE_FOR_ALL_POLICY_FACTORY_ABI,
  CONSTANT_VOICE_CREDIT_PROXY_FACTORY_ABI,
} from "@/src/generated/abis";

// Overrides for errors a user is likely to hit directly from the poll-deployment/voting flows.
// Anything not listed here falls back to a sentence-cased version of the Solidity error name.
const FRIENDLY_MESSAGES: Record<string, string> = {
  UnsupportedMode: "This community's governance contract doesn't support that voting mechanism.",
  UnsupportedPolicy: "This community's governance contract doesn't support that eligibility policy.",
  StartTimeMustBeInFuture: "The poll's start date must be in the future.",
  EndTimeMustBeAfterStartTime: "The poll's end date must be after its start date.",
  TooManyVoteOptions: "Too many voting options for this poll's configuration.",
  InvalidPublicKey: "The coordinator public key is invalid.",
  PollDoesNotExist: "That poll doesn't exist.",
  UserNotSignedUp: "You haven't signed up to this community yet.",
  PollNotTallied: "This poll hasn't finished tallying yet.",
};

// Only "error" fragments are kept (rather than the full ABIs) so identical constructor/function
// fragments repeated across contracts (e.g. every policy's `trait()`) don't produce duplicate-
// fragment warnings from ethers.
const errorFragments = [
  MACI_ABI,
  POLL_ABI,
  BASE_POLICY_ABI,
  BASE_CHECKER_ABI,
  FREE_FOR_ALL_POLICY_ABI,
  FREE_FOR_ALL_POLICY_FACTORY_ABI,
  CONSTANT_VOICE_CREDIT_PROXY_FACTORY_ABI,
].flatMap((abi) => abi.filter((fragment) => fragment.type === "error"));

const contractErrorInterface = new Interface(errorFragments);

function splitCamelCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function extractRevertData(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const candidates = [
    (err as { data?: unknown }).data,
    (err as { info?: { error?: { data?: unknown } } }).info?.error?.data,
    (err as { error?: { data?: unknown } }).error?.data,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.startsWith("0x") && candidate.length >= 10) {
      return candidate;
    }
  }
  return null;
}

/** Decodes a Solidity custom-error revert (e.g. ethers' "unknown custom error") into a readable
 * message. Falls back to ethers' own short message when the revert data doesn't match any ABI
 * this frontend knows about — e.g. a require() string, which ethers already decodes on its own. */
export function decodeContractError(err: unknown): string {
  const data = extractRevertData(err);
  if (data) {
    try {
      const parsed = contractErrorInterface.parseError(data);
      if (parsed) {
        if (FRIENDLY_MESSAGES[parsed.name]) return FRIENDLY_MESSAGES[parsed.name];
        const args = parsed.args.length > 0 ? ` (${parsed.args.map(String).join(", ")})` : "";
        return `${splitCamelCase(parsed.name)}${args}`;
      }
    } catch {
      // Revert data present but not parseable against any known ABI — fall through.
    }
  }

  if (err instanceof Error) {
    return (err as Error & { shortMessage?: string }).shortMessage ?? err.message;
  }
  return String(err);
}
