import { NextResponse, type NextRequest } from 'next/server';
import { getAlchemyNftApiUrl } from '@/config/alchemy';
import { isAddress } from 'viem';

interface AlchemyNftResponse {
  ownedNfts: Array<{
    contract?: {
      address?: string;
    };
    tokenId?: string;
  }>;
  totalCount: number;
  pageKey?: string;
}

interface OwnershipResponse {
  ownsToken: boolean;
  tokenIds: string[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('userAddress');
    const tokenAddress = searchParams.get('tokenAddress');
    const chainIdParam = searchParams.get('chainId');

    // Validate required parameters
    if (!userAddress || !tokenAddress || !chainIdParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: userAddress, tokenAddress, and chainId are required' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!isAddress(userAddress)) {
      return NextResponse.json({ error: 'Invalid userAddress format' }, { status: 400 });
    }

    if (!isAddress(tokenAddress)) {
      return NextResponse.json({ error: 'Invalid tokenAddress format' }, { status: 400 });
    }

    // Validate and parse chainId
    const chainId = parseInt(chainIdParam, 10);
    if (isNaN(chainId)) {
      return NextResponse.json({ error: 'Invalid chainId: must be a number' }, { status: 400 });
    }

    // Get Alchemy API key from environment
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      console.error('ALCHEMY_API_KEY environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get Alchemy API URL for the chain
    const alchemyUrl = getAlchemyNftApiUrl(chainId, apiKey);
    if (!alchemyUrl) {
      return NextResponse.json(
        {
          error: `Unsupported chain ID: ${chainId}. Supported chains: Optimism, Optimism Sepolia, Base Sepolia, Scroll Sepolia`
        },
        { status: 400 }
      );
    }

    // Build query parameters for Alchemy API
    // Alchemy expects contractAddresses[] as an array parameter
    const alchemyParams = new URLSearchParams({
      owner: userAddress,
      withMetadata: 'false' // We don't need metadata, just token IDs
    });

    // Append contractAddresses[] parameter (Alchemy expects array format)
    alchemyParams.append('contractAddresses[]', tokenAddress);

    const fullUrl = `${alchemyUrl}?${alchemyParams.toString()}`;

    // Call Alchemy API
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alchemy API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch NFTs from Alchemy API: ${response.statusText}` },
        { status: response.status || 500 }
      );
    }

    const data: AlchemyNftResponse = await response.json();

    // Extract token IDs from the response
    // Alchemy API already filters by contractAddresses[], so we just extract tokenIds
    const tokenIds = (data.ownedNfts || [])
      .map(nft => nft.tokenId)
      .filter((tokenId): tokenId is string => tokenId !== undefined && tokenId !== null);

    const result: OwnershipResponse = {
      ownsToken: tokenIds.length > 0,
      tokenIds
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
    return NextResponse.json({ error: 'Internal server error while checking NFT ownership' }, { status: 500 });
  }
}
