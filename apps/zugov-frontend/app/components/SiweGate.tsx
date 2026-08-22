import { useSiwe } from "@/src/hooks/useSiwe";

type Props = {
  children: React.ReactNode;
  message?: string;
};

// /plan-eng-review (2026-08-23) — no more `siwe` prop. useSiwe() now reads from the single
// app-wide SiweProvider (app/providers.tsx), so every call site — including this one — already
// gets the same shared instance for free. The prop existed only to work around each useSiwe()
// call previously mounting its own independent state; that's the exact bug this Context switch
// fixes structurally.
export function SiweGate({ children, message = "Sign in with Ethereum to continue" }: Props) {
  const { isAuthenticated, isSigning, error, signIn } = useSiwe();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-gray-400 text-sm max-w-xs">{message}</p>
      <button
        onClick={() => void signIn()}
        disabled={isSigning}
        className="px-6 py-3 bg-accent text-white rounded-[6px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
