import { useSiwe } from "@/src/hooks/useSiwe";

type Props = {
  children: React.ReactNode;
  message?: string;
  // Share a caller-owned useSiwe() instance so a session invalidated elsewhere on the page (e.g.
  // signOut() after a 401) is reflected here too. Without this, SiweGate's own internal instance
  // keeps believing isAuthenticated: true and never falls back to the sign-in prompt.
  siwe?: ReturnType<typeof useSiwe>;
};

export function SiweGate({ children, message = "Sign in with Ethereum to continue", siwe }: Props) {
  const ownSiwe = useSiwe();
  const { isAuthenticated, isSigning, error, signIn } = siwe ?? ownSiwe;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-gray-400 text-sm max-w-xs">{message}</p>
      <button
        onClick={() => void signIn()}
        disabled={isSigning}
        className="px-6 py-3 bg-[#648DAF] text-white rounded-[6px] font-semibold hover:bg-[#86A6C1] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSigning ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Signing...
          </span>
        ) : (
          "Sign in with Ethereum"
        )}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
