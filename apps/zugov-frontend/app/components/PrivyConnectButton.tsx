import { usePrivy } from "@privy-io/react-auth";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function PrivyConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (authenticated) {
    const address = user?.wallet?.address;
    return (
      <button
        onClick={() => void logout()}
        className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-700 rounded-[6px] hover:bg-gray-800 transition-colors"
      >
        {address ? truncateAddress(address) : "Account"}
      </button>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-[6px] hover:bg-accent-hover transition-colors"
    >
      Sign in
    </button>
  );
}
