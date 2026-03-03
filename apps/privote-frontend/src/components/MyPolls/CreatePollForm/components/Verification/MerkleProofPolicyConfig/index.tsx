import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { MerkleTreeManager } from '@/services/MerkleTreeManager';
import styles from '../index.module.css';
import { IPolicyConfigProps } from '../types';
import { Hex, isAddress } from 'viem';
import { StandardMerkleTreeData } from '@openzeppelin/merkle-tree/dist/standard';
import { notification } from '@/utils/notification';

type MerkleInputMode = 'addresses' | 'upload';

/**
 * Configuration form for Merkle proof policy
 */
const MerkleProofPolicyConfig = ({ config, onConfigChange }: IPolicyConfigProps) => {
  const [inputMode, setInputMode] = useState<MerkleInputMode>('addresses');
  const [addressList, setAddressList] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validAddressCount, setValidAddressCount] = useState(0);
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create MerkleTreeManager instance
  const merkleManager = useMemo(() => new MerkleTreeManager(), []);

  // Validate Ethereum addresses
  const validateAddresses = useCallback((addresses: string[]) => {
    const cleanAddresses = addresses.map(addr => addr.trim()).filter(addr => addr.length > 0);
    const validAddresses: string[] = [];
    const invalidAddresses: string[] = [];

    cleanAddresses.forEach(addr => {
      if (isAddress(addr)) {
        validAddresses.push(addr);
      } else {
        invalidAddresses.push(addr);
      }
    });

    return { validAddresses, invalidAddresses };
  }, []);

  // Generate Merkle tree from addresses using MerkleTreeManager
  const generateMerkleTree = useCallback(
    (addresses: string[]) => {
      try {
        const { validAddresses, invalidAddresses } = validateAddresses(addresses);

        if (validAddresses.length === 0) {
          throw new Error('No valid Ethereum addresses provided');
        }

        // Use MerkleTreeManager to create tree
        const tree = merkleManager.createTreeFromAddresses(validAddresses as Hex[]);
        const root = tree.root;
        const treeJSON = merkleManager.exportToJSON(validAddresses);

        // Calculate tree depth (log2 of number of leaves, rounded up)
        const treeDepth = Math.ceil(Math.log2(validAddresses.length));

        // Create metadata
        const metadata = {
          totalLeaves: validAddresses.length,
          treeDepth
        };

        // Add metadata to tree JSON
        const enhancedTreeJSON = {
          ...treeJSON,
          metadata
        };

        return {
          root,
          treeJSON: enhancedTreeJSON,
          metadata,
          validAddresses,
          invalidAddresses
        };
      } catch (error) {
        throw new Error(`Failed to generate Merkle tree: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [merkleManager, validateAddresses]
  );

  // Debounced tree generation
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time address validation (no tree generation)
  const validateAddressesRealTime = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setValidAddressCount(0);
        setInvalidAddresses([]);
        return;
      }

      const addresses = value
        .split('\n')
        .map(addr => addr.trim())
        .filter(Boolean);
      const { validAddresses, invalidAddresses } = validateAddresses(addresses);

      setValidAddressCount(validAddresses.length);
      setInvalidAddresses(invalidAddresses);
    },
    [validateAddresses]
  );

  // Generate tree with debouncing
  const generateTreeDebounced = useCallback(
    (addresses: string[]) => {
      setIsGenerating(true);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (addresses.length === 0) return;

        try {
          const treeData = generateMerkleTree(addresses);

          onConfigChange({
            ...config,
            merkleRoot: treeData.root,
            merkleTreeData: JSON.stringify(treeData.treeJSON)
          });

          if (treeData.invalidAddresses.length > 0) {
            notification.warning(`Excluded ${treeData.invalidAddresses.length} invalid addresses from tree`);
          }
        } catch (error) {
          onConfigChange({
            ...config,
            merkleRoot: '',
            merkleTreeData: ''
          });
        } finally {
          setIsGenerating(false);
        }
      }, 1000); // 1 second debounce
    },
    [config, onConfigChange, generateMerkleTree]
  );

  // Handle address list change
  const handleAddressListChange = useCallback(
    (value: string) => {
      setAddressList(value);

      // Real-time validation feedback
      validateAddressesRealTime(value);

      if (!value.trim()) {
        onConfigChange({
          ...config,
          merkleRoot: '',
          merkleTreeData: ''
        });
        return;
      }

      const addresses = value
        .split('\n')
        .map(addr => addr.trim())
        .filter(Boolean);
      const { validAddresses } = validateAddresses(addresses);

      if (validAddresses.length > 0) {
        generateTreeDebounced(addresses);
      } else {
        onConfigChange({
          ...config,
          merkleRoot: '',
          merkleTreeData: ''
        });
      }
    },
    [config, onConfigChange, validateAddressesRealTime, generateTreeDebounced, validateAddresses]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/json') {
        return;
      }

      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result as string;
          const treeJSON: StandardMerkleTreeData<Hex[]> = JSON.parse(content);

          // Validate tree structure
          if (!treeJSON.format || !treeJSON.tree || !treeJSON.values) {
            throw new Error('Invalid tree JSON structure');
          }

          const tree = merkleManager.createTreeFromJSON(treeJSON);
          const addressCount = treeJSON.values.length;

          // Extract or calculate metadata
          let metadata = {
            totalLeaves: addressCount,
            treeDepth: Math.ceil(Math.log2(addressCount))
          };

          // Use existing metadata if available
          if ('metadata' in treeJSON && treeJSON.metadata) {
            metadata = {
              ...metadata,
              ...(treeJSON.metadata as any)
            };
          }

          onConfigChange({
            ...config,
            merkleRoot: tree.root,
            merkleTreeData: content
          });

          setValidAddressCount(addressCount);
          setInvalidAddresses([]);
          notification.success(`Successfully loaded Merkle tree with ${addressCount} addresses`);
        } catch (error) {
          setValidAddressCount(0);
          notification.error('Failed to load tree file');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        notification.error('Failed to read file');
      };

      reader.readAsText(file);
    },
    [config, onConfigChange, merkleManager]
  );

  // Clear file input
  const clearFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onConfigChange({
      ...config,
      merkleRoot: '',
      merkleTreeData: ''
    });
    setValidAddressCount(0);
    setInvalidAddresses([]);
  }, [config, onConfigChange]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.policyConfig}>
      {/* Input Mode Selection */}
      <div className={styles.configField}>
        <label>Merkle Tree Configuration Method</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type='radio'
              name='merkleInputMode'
              value='addresses'
              checked={inputMode === 'addresses'}
              onChange={() => setInputMode('addresses')}
            />
            <span>Provide Address List</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type='radio'
              name='merkleInputMode'
              value='upload'
              checked={inputMode === 'upload'}
              onChange={() => setInputMode('upload')}
            />
            <span>Upload tree.json</span>
          </label>
        </div>
      </div>

      {/* Address List Input */}
      {inputMode === 'addresses' && (
        <div className={styles.configField}>
          <label htmlFor='addressList'>
            Eligible Addresses
            <span className={styles.helpText}>
              Enter one Ethereum address per line. The Merkle tree will be generated automatically.
            </span>
          </label>

          {/* Address Count Display */}
          {addressList && (
            <div className={styles.addressCount}>
              <span className={styles.validCount}>🟢 {validAddressCount} valid</span>
              {invalidAddresses.length > 0 && (
                <span className={styles.invalidCount}>🔴 {invalidAddresses.length} invalid</span>
              )}
            </div>
          )}

          <textarea
            id='addressList'
            className={styles.textarea}
            placeholder={`0x1234567890123456789012345678901234567890\n0xabcdefabcdefabcdefabcdefabcdefabcdefabcd\n...`}
            value={addressList}
            onChange={e => handleAddressListChange(e.target.value)}
            rows={8}
          />

          {/* Invalid Addresses Display */}
          {invalidAddresses.length > 0 && (
            <details className={styles.invalidAddressesDetails}>
              <summary>View {invalidAddresses.length} invalid addresses</summary>
              <div className={styles.invalidAddressesList}>
                {invalidAddresses.map((addr, index) => (
                  <div key={index} className={styles.invalidAddress}>
                    {addr}
                  </div>
                ))}
              </div>
            </details>
          )}

          {isGenerating && (
            <div className={styles.loadingIndicator}>
              <span>🔄 Generating Merkle tree...</span>
            </div>
          )}
        </div>
      )}

      {/* File Upload */}
      {inputMode === 'upload' && (
        <div className={styles.configField}>
          <label htmlFor='treeFile'>
            Upload tree.json
            <span className={styles.helpText}>
              Upload a JSON file containing the Merkle tree structure with root, leaves, and tree data.
            </span>
          </label>

          {/* File Upload Status */}
          {validAddressCount > 0 && (
            <div className={styles.fileUploadStatus}>
              <span className={styles.fileStatusSuccess}>✅ Loaded {validAddressCount} addresses from file</span>
            </div>
          )}

          <div className={styles.fileUploadContainer}>
            <input
              ref={fileInputRef}
              type='file'
              id='treeFile'
              accept='.json'
              onChange={handleFileUpload}
              className={styles.fileInput}
              disabled={isUploading}
            />
            {config.merkleTreeData && (
              <button type='button' onClick={clearFileInput} className={styles.clearButton} disabled={isUploading}>
                Clear
              </button>
            )}
          </div>

          {isUploading && (
            <div className={styles.loadingIndicator}>
              <span>📋 Uploading and validating file...</span>
            </div>
          )}
        </div>
      )}

      {/* Generated Merkle Root Display */}
      {config.merkleRoot && (
        <div className={styles.configField}>
          <label htmlFor='merkleRoot'>Generated Merkle Root</label>
          <input type='text' id='merkleRoot' value={config.merkleRoot} readOnly className={styles.readOnlyInput} />
        </div>
      )}

      {/* Additional Info */}
      <div className={styles.infoBox}>
        <h4>📋 How it works:</h4>
        <ul>
          <li>
            <strong>Address List Mode:</strong> Enter Ethereum addresses line by line. Real-time validation shows
            valid/invalid counts.
          </li>
          <li>
            <strong>File Upload Mode:</strong> Upload a pre-generated tree.json file. We validate the JSON structure,
            recreate the tree for integrity verification, and extract metadata.
          </li>
          <li>
            <strong>Tree Generation:</strong> Uses OpenZeppelin's StandardMerkleTree with keccak256 hashing and sorted
            pairs for consistency and gas optimization.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MerkleProofPolicyConfig;
