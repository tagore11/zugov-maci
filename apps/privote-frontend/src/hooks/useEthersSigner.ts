import { type Config, useConnectorClient, usePublicClient } from 'wagmi';

import { BrowserProvider, JsonRpcSigner, type Eip1193Provider } from 'ethers';
import { useMemo } from 'react';
import { zeroAddress, type Account, type Chain, type Client, type PublicClient, type Transport } from 'viem';

function wrapTransportAsEip1193Provider(transport: unknown) {
  const t: any = transport as any;
  return {
    request: async ({ method, params }: { method: string; params?: any }) => {
      const normalizedParams =
        params === undefined || (Array.isArray(params) && params.length === 0) ? undefined : params;
      return t.request({ method, params: normalizedParams });
    },
    on: t.on?.bind(t),
    removeListener: t.removeListener?.bind(t)
  } as unknown as Eip1193Provider;
}

export function clientToSigner(client: Client<Transport, Chain, Account> | PublicClient<Transport, Chain>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  };

  const eip1193Provider = wrapTransportAsEip1193Provider(transport);
  const provider = new BrowserProvider(eip1193Provider, network);
  const signer = new JsonRpcSigner(provider, account ? account.address : zeroAddress);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: connectorClient } = useConnectorClient<Config>({ chainId });
  const publicClient = usePublicClient();

  const connectorSigner = useMemo(() => {
    if (!connectorClient) return undefined;
    return clientToSigner(connectorClient);
  }, [connectorClient]);

  const publicSigner = useMemo(() => {
    if (!publicClient) return undefined;
    return clientToSigner(publicClient);
  }, [publicClient]);

  return useMemo(() => connectorSigner ?? publicSigner, [connectorSigner, publicSigner]);
}

export default useEthersSigner;
