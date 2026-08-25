import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContractAddressLoader, ContractConfigSummary } from "./ContractAddressLoader";
import type { MaciContractConfig } from "@/src/hooks/useMaciContractConfig";

const fetchConfigMock = vi.fn();
const resetMock = vi.fn();
let mockIsLoading = false;
let mockError: string | null = null;

vi.mock("@/src/hooks/useMaciContractConfig", () => ({
  useMaciContractConfig: () => ({
    isLoading: mockIsLoading,
    error: mockError,
    data: null,
    fetchConfig: fetchConfigMock,
    reset: resetMock,
  }),
}));

const VALID_ADDRESS = "0x1234567890123456789012345678901234567890";

const CONTRACT_CONFIG: MaciContractConfig = {
  allowedPolicies: [0],
  supportedModes: [0],
  signUpPolicyType: "FreeForAll",
  signUpPolicyAddress: "0xsignup",
  deploymentBlock: 1,
  stateTreeDepth: 10,
  pollDeployConfig: undefined,
};

function renderLoader(overrides: Partial<React.ComponentProps<typeof ContractAddressLoader>> = {}) {
  const props = {
    chainId: 11155111,
    onChainIdChange: vi.fn(),
    contractAddress: "",
    onContractAddressChange: vi.fn(),
    onConfigLoaded: vi.fn(),
    ...overrides,
  };
  render(<ContractAddressLoader {...props} />);
  return props;
}

beforeEach(() => {
  fetchConfigMock.mockReset();
  resetMock.mockReset();
  mockIsLoading = false;
  mockError = null;
});

describe("ContractAddressLoader", () => {
  it("disables Load Contract until a valid address is entered", () => {
    renderLoader({ contractAddress: "not-an-address" });
    expect(screen.getByText("Load Contract")).toBeDisabled();
  });

  it("enables Load Contract once a valid address is present", () => {
    renderLoader({ contractAddress: VALID_ADDRESS });
    expect(screen.getByText("Load Contract")).not.toBeDisabled();
  });

  it("changing the chain resets the loaded config and the underlying hook state", () => {
    const props = renderLoader({ contractAddress: VALID_ADDRESS });
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const otherOption = Array.from(select.options).find((opt) => opt.value !== String(props.chainId));
    fireEvent.change(select, { target: { value: otherOption!.value } });
    expect(props.onConfigLoaded).toHaveBeenCalledWith(null);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it("changing the address resets the loaded config and the underlying hook state", () => {
    const props = renderLoader({ contractAddress: VALID_ADDRESS });
    fireEvent.change(screen.getByPlaceholderText("0x..."), { target: { value: "0xnew" } });
    expect(props.onConfigLoaded).toHaveBeenCalledWith(null);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it("a successful fetch surfaces the loaded config to the parent via onConfigLoaded", async () => {
    fetchConfigMock.mockResolvedValue(CONTRACT_CONFIG);
    const props = renderLoader({ contractAddress: VALID_ADDRESS });
    fireEvent.click(screen.getByText("Load Contract"));
    await vi.waitFor(() => expect(props.onConfigLoaded).toHaveBeenCalledWith(CONTRACT_CONFIG));
  });

  it("shows the hook's error message on fetch failure, not a crash", () => {
    mockError = "Could not reach the RPC endpoint";
    renderLoader({ contractAddress: VALID_ADDRESS });
    expect(screen.getByText("Could not reach the RPC endpoint")).toBeInTheDocument();
  });
});

describe("ContractConfigSummary", () => {
  it("renders the detected on-chain configuration", () => {
    render(<ContractConfigSummary config={CONTRACT_CONFIG} />);
    expect(screen.getByText("Detected on-chain configuration")).toBeInTheDocument();
    expect(screen.getByText("state tree depth 10", { exact: false })).toBeInTheDocument();
  });
});
