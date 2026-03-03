import { toBytes, toHex, type Hex } from 'viem';

interface OptionInfo {
  cid: `0x${string}`;
  description?: string;
  link?: string;
  // Add more fields here in the future
}

export interface DecodedOptionInfo {
  cid: string;
  description: string;
  link: string;
}

export function decodeOptionInfo(hex: string): DecodedOptionInfo {
  if (!hex || hex === '0x') {
    return { cid: '0x', description: '', link: '' };
  }
  try {
    const hexStr = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = Buffer.from(hexStr, 'hex');
    const jsonString = bytes.toString('utf8');
    const data = JSON.parse(jsonString) as { version?: number; cid?: string; description?: string; link?: string };
    if (data.version === 2 && typeof data.cid === 'string') {
      return {
        cid: data.cid,
        description: data.description ?? '',
        link: data.link ?? ''
      };
    }
    // Unrecognized version — fall through to treat hex as raw binary CID
  } catch {
    // Old format: treat the raw hex as a binary CID
  }
  return { cid: hex, description: '', link: '' };
}

export function encodeOptionInfo(info: OptionInfo): Hex {
  // Create an object with version for future compatibility
  const data = {
    version: 2,
    cid: info.cid,
    description: info.description || '',
    link: info.link || ''
  };

  // Convert to JSON and then to bytes
  const jsonString = JSON.stringify(data);
  const bytes = toBytes(jsonString);
  return toHex(bytes);
}
