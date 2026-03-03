import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { Hex, isAddress } from 'viem';
import * as fs from 'fs';
import { StandardMerkleTreeData } from '@openzeppelin/merkle-tree/dist/standard';

export class MerkleTreeManager {
  private tree: StandardMerkleTree<Hex[]> | null = null;

  /**
   * Create Merkle tree from array of addresses
   */
  createTreeFromAddresses(addresses: Hex[]): StandardMerkleTree<Hex[]> {
    if (!addresses || addresses.length === 0) {
      throw new Error('Addresses array cannot be empty');
    }

    // Validate addresses format (basic Ethereum address validation)
    const invalidAddresses = addresses.filter(addr => !isAddress(addr));

    if (invalidAddresses.length > 0) {
      throw new Error(`Invalid address format found: ${invalidAddresses.join(', ')}`);
    }

    // Hash each address using keccak256
    const leaves: Hex[][] = addresses.map(addr => [addr]);

    // Create the Merkle tree
    this.tree = StandardMerkleTree.of(leaves, ['address']);

    return this.tree;
  }

  /**
   * Get the Merkle root as hex string
   */
  getRoot(): string {
    if (!this.tree) {
      throw new Error('Tree not initialized. Call createTreeFromAddresses first.');
    }
    return this.tree.root;
  }

  /**
   * Get the current tree instance
   */
  getTree(): StandardMerkleTree<Hex[]> | null {
    return this.tree;
  }

  /**
   * Export tree structure to JSON format
   */
  exportToJSON(addresses: string[]): StandardMerkleTreeData<Hex[]> {
    if (!this.tree) {
      throw new Error('Tree not initialized. Call createTreeFromAddresses first.');
    }

    return this.tree.dump();
  }

  /**
   * Create Merkle tree from JSON data
   */
  createTreeFromJSON(jsonData: StandardMerkleTreeData<Hex[]>): StandardMerkleTree<Hex[]> {
    // Recreate the tree from merkle tree dump
    this.tree = StandardMerkleTree.load(jsonData);
    return this.tree;
  }

  /**
   * Get proof for a specific address
   */
  getProof(address: Hex): Hex[] {
    if (!this.tree) {
      throw new Error('Tree not initialized.');
    }

    if (!isAddress(address)) {
      throw new Error('Invalid address format');
    }

    // Find the address in the tree and generate proof
    let proof: Hex[] | null = null;
    for (const [i, v] of this.tree.entries()) {
      if (v[0].toLowerCase() === address.toLowerCase()) {
        proof = this.tree.getProof(i) as Hex[];
        break;
      }
    }

    if (!proof) {
      throw new Error(`Address ${address} not found in the Merkle tree. Make sure it's in the whitelist.`);
    }

    return proof;
  }

  /**
   * Verify a proof for an address
   */
  verifyProof(address: Hex, proof: Hex[]): boolean {
    if (!isAddress(address)) {
      throw new Error('Invalid address format');
    }

    if (!this.tree) {
      throw new Error('Tree not initialized.');
    }

    return this.tree.verify([address], proof);
  }

  /**
   * Get all proofs for addresses in the tree
   */
  getAllProofs(addresses: Hex[]): Map<Hex, Hex[]> {
    const proofs = new Map<Hex, Hex[]>();

    addresses.forEach(address => {
      try {
        const proof = this.getProof(address);
        proofs.set(address, proof);
      } catch (error) {
        console.warn(`Failed to get proof for address ${address}:`, error);
      }
    });

    return proofs;
  }

  /**
   * Save tree to JSON file
   */
  async saveToFile(addresses: string[], filename: string = 'tree.json'): Promise<void> {
    const treeJSON = this.exportToJSON(addresses);

    try {
      await fs.promises.writeFile(filename, JSON.stringify(treeJSON, null, 2));
      console.log(`✅ Tree saved to ${filename}`);
    } catch (error) {
      throw new Error(`Failed to save tree to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load tree from JSON file
   */
  async loadFromFile(filename: string): Promise<StandardMerkleTree<Hex[]>> {
    try {
      const fileContent = await fs.promises.readFile(filename, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      return this.createTreeFromJSON(jsonData);
    } catch (error) {
      throw new Error(`Failed to load tree from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
