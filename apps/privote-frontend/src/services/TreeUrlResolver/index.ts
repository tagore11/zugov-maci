/**
 * TreeUrlResolver - Version-aware Merkle tree URL resolution service
 * Handles different URL formats based on merkleTreeVersion for future extensibility
 */

export interface TreeUrlConfig {
  version: string;
  baseUrl: string;
  metadata?: Record<string, any>;
}

export class TreeUrlResolver {
  private static readonly VERSION_HANDLERS: Record<string, (config: TreeUrlConfig) => string> = {
    '0.0.0': TreeUrlResolver.handleV000
    // Future versions can be added here:
    // '1.0.0': TreeUrlResolver.handleV100, // Could handle IPFS CIDs
    // '2.0.0': TreeUrlResolver.handleV200, // Could handle different storage providers
  };

  /**
   * Resolve tree.json URL based on version
   */
  static resolveTreeUrl(version: string, baseUrl: string, metadata?: Record<string, any>): string {
    const config: TreeUrlConfig = { version, baseUrl, metadata };

    const handler = this.VERSION_HANDLERS[version];
    if (!handler) {
      // Fallback to latest known version handler
      const latestVersion = this.getLatestSupportedVersion();
      console.warn(`Unsupported tree version ${version}, falling back to ${latestVersion}`);
      return this.VERSION_HANDLERS[latestVersion](config);
    }

    return handler(config);
  }

  /**
   * Handler for version 0.0.0 - Direct URL
   */
  private static handleV000(config: TreeUrlConfig): string {
    // For v0.0.0, the baseUrl is the direct URL to tree.json
    return config.baseUrl;
  }

  /**
   * Future handler for version 1.0.0 - IPFS CID support
   * Example implementation for future use
   */
  private static handleV100(config: TreeUrlConfig): string {
    const { baseUrl, metadata } = config;

    // Check if baseUrl is an IPFS CID (starts with 'Qm' or 'bafy')
    if (baseUrl.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{55})$/)) {
      // Use IPFS gateway
      const gateway = metadata?.ipfsGateway || 'https://ipfs.io/ipfs/';
      return `${gateway}${baseUrl}`;
    }

    // Fallback to direct URL
    return baseUrl;
  }

  /**
   * Future handler for version 2.0.0 - Advanced storage providers
   * Example implementation for future use
   */
  private static handleV200(config: TreeUrlConfig): string {
    const { baseUrl, metadata } = config;

    // Could handle different storage providers based on metadata
    const provider = metadata?.storageProvider || 'direct';

    switch (provider) {
      case 'ipfs':
        return this.handleV100(config); // Reuse IPFS logic
      case 'arweave':
        return `https://arweave.net/${baseUrl}`;
      case 'direct':
      default:
        return baseUrl;
    }
  }

  /**
   * Get the latest supported version
   */
  private static getLatestSupportedVersion(): string {
    const versions = Object.keys(this.VERSION_HANDLERS);
    return versions.sort((a, b) => this.compareVersions(b, a))[0];
  }

  /**
   * Compare version strings (semver-like)
   */
  private static compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  }

  /**
   * Validate if a version is supported
   */
  static isSupportedVersion(version: string): boolean {
    return version in this.VERSION_HANDLERS;
  }

  /**
   * Get all supported versions
   */
  static getSupportedVersions(): string[] {
    return Object.keys(this.VERSION_HANDLERS);
  }

  /**
   * Get version-specific metadata requirements
   */
  static getVersionRequirements(version: string): Record<string, any> {
    switch (version) {
      case '0.0.0':
        return {
          description: 'Direct URL to tree.json file',
          requiredFields: ['baseUrl'],
          optionalFields: []
        };
      case '1.0.0':
        return {
          description: 'IPFS CID or direct URL with optional gateway',
          requiredFields: ['baseUrl'],
          optionalFields: ['ipfsGateway']
        };
      case '2.0.0':
        return {
          description: 'Advanced storage provider support',
          requiredFields: ['baseUrl'],
          optionalFields: ['storageProvider', 'ipfsGateway']
        };
      default:
        return {
          description: 'Unknown version',
          requiredFields: ['baseUrl'],
          optionalFields: []
        };
    }
  }
}

export default TreeUrlResolver;
