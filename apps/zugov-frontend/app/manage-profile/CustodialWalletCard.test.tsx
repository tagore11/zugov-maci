import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustodialWalletCard } from "./CustodialWalletCard";

const ADDRESS = "0x1111111111111111111111111111111111111111";

let accountMock = { address: ADDRESS as string | undefined, isConnected: true };
let walletsMock: { address: string; walletClientType: string }[] = [];
let walletsReadyMock = true;
let balanceMock: { data: unknown; isLoading: boolean } = { data: undefined, isLoading: false };

vi.mock("wagmi", () => ({
  useAccount: () => accountMock,
  useBalance: () => balanceMock,
  useChainId: () => 11155111,
}));

vi.mock("@privy-io/react-auth", () => ({
  useWallets: () => ({ wallets: walletsMock, ready: walletsReadyMock }),
}));

beforeEach(() => {
  accountMock = { address: ADDRESS, isConnected: true };
  walletsMock = [];
  walletsReadyMock = true;
  balanceMock = { data: undefined, isLoading: false };
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
});

describe("CustodialWalletCard", () => {
  it("renders nothing when the wallet is not connected", () => {
    accountMock = { address: undefined, isConnected: false };
    const { container } = render(<CustodialWalletCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a self-custody (external) wallet like MetaMask", () => {
    walletsMock = [{ address: ADDRESS, walletClientType: "metamask" }];
    const { container } = render(<CustodialWalletCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the address, network, and balance for a Privy-embedded (custodial) wallet", () => {
    walletsMock = [{ address: ADDRESS, walletClientType: "privy" }];
    balanceMock = { data: { formatted: "1.23456", symbol: "ETH" }, isLoading: false };

    render(<CustodialWalletCard />);

    expect(screen.getByText("Custodial Wallet")).toBeInTheDocument();
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
    expect(screen.getByText("1.2346 ETH")).toBeInTheDocument();
  });

  it("also recognizes the newer privy-v2 embedded wallet client type", () => {
    walletsMock = [{ address: ADDRESS, walletClientType: "privy-v2" }];
    render(<CustodialWalletCard />);
    expect(screen.getByText("Custodial Wallet")).toBeInTheDocument();
  });

  it("shows a loading placeholder for balance while it's still being fetched", () => {
    walletsMock = [{ address: ADDRESS, walletClientType: "privy" }];
    balanceMock = { data: undefined, isLoading: true };

    render(<CustodialWalletCard />);

    expect(screen.getByText("…")).toBeInTheDocument();
  });

  it("copies the address to the clipboard when the copy button is clicked", async () => {
    walletsMock = [{ address: ADDRESS, walletClientType: "privy" }];
    render(<CustodialWalletCard />);

    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(screen.getByLabelText("Copy wallet address"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(ADDRESS);
  });
});
