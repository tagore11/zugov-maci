import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { BrowserProvider } from "ethers";
import { signup } from "@maci-protocol/sdk/browser";
import { useMaci } from "../context/MaciContext";
import { GovernanceTypes, type GovernanceType } from "../config";

interface UseSignupResult {
  isSigningUp: boolean;
  signupError: string | null;
  signupToMaci: (maciAddress: string) => Promise<void>;
}

async function getEthersSigner() {
  if (!window.ethereum) throw new Error("No wallet found");
  const provider = new BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export function useSignup(governanceType: GovernanceType | undefined): UseSignupResult {
  const { isConnected } = useAccount();
  const { maciKeypair } = useMaci();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const signupToMaci = useCallback(
    async (maciAddress: string) => {
      if (!isConnected) throw new Error("Wallet not connected");
      if (!maciKeypair) throw new Error("MACI keypair not available");
      if (!governanceType || governanceType !== GovernanceTypes.MACI) {
        throw new Error(`Signup not supported for governance type "${governanceType}"`);
      }

      setIsSigningUp(true);
      setSignupError(null);

      try {
        const signer = await getEthersSigner();
        await signup({
          maciPublicKey: maciKeypair.publicKey.serialize(),
          maciAddress,
          sgData: "0x",
          signer,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setSignupError(message);
        throw err;
      } finally {
        setIsSigningUp(false);
      }
    },
    [isConnected, maciKeypair, governanceType],
  );

  return { isSigningUp, signupError, signupToMaci };
}
