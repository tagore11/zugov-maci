import { usePrivy } from "@privy-io/react-auth";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function PrivyConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (authenticated) {
    const address = user?.wallet?.address;
    return (
      <button
        onClick={() => void logout()}
        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {address ? truncateAddress(address) : "Account"}
      </button>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Sign in
    </button>
  );
}
