import { Keypair, PrivateKey } from '@maci-protocol/domainobjs';
import { Hex } from 'viem';

export function generateKeypairFromSeed(seed: Hex) {
  return new Keypair(new PrivateKey(BigInt(seed)));
}
