import { io, type Socket } from 'socket.io-client';
import { type IProof, type ITallyData } from '@maci-protocol/sdk/browser';
import { PUBLIC_COORDINATOR_SERVICE_URL } from '@/utils/constants';
import { Hex } from 'viem';

/**
 * WS events for proof generation
 */
export enum EProofGenerationEvents {
  START = 'start-generation',
  PROGRESS = 'progress-generation',
  MERGE_FINISH = 'finish-merge',
  GENERATE_FINISH = 'finish-generation',
  SUBMIT_FINISH = 'finish-submit',
  ERROR = 'exception'
}

/**
 * Interface for proof generation progress data
 */
export interface IGenerateProofsBatchData {
  proofs: IProof[];
  current: number;
  total: number;
}

/**
 * Interface for proof generation completion data
 */
export interface IProofGenerationResult {
  processProofs: IProof[];
  tallyData: ITallyData;
}

/**
 * Interface for proof generation error data
 */
export interface IProofGenerationError {
  message: string;
}

export enum EMode {
  QV,
  NON_QV,
  FULL,
  RANKED
}

/**
 * Interface for proof generation request data
 */
export interface IGenerateProofDto {
  approval?: string;
  sessionKeyAddress?: Hex;
  chain: string;
  poll: number;
  maciContractAddress: string;
  mode: EMode;
  startBlock?: number;
  endBlock?: number;
  blocksPerBatch?: number;
  useWasm?: boolean;
}

/**
 * Callback functions for proof generation events
 */
export interface IProofGenerationCallbacks {
  onMergeComplete?: () => void;
  onProgress?: (data: IGenerateProofsBatchData) => void;
  onGenerationComplete?: (result: { processProofs: IProof[] }) => void;
  onSubmitComplete?: (tally: ITallyData) => void;
  onComplete?: (result: IProofGenerationResult) => void; // final, after submit
  onError?: (error: IProofGenerationError) => void;
}

/**
 * WebSocket service for proof generation with robust error handling and reconnection
 */
export class ProofWebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 2000;
  private authToken: string | null = null;

  /**
   * Initialize WebSocket connection
   */
  async connect(authToken: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    this.authToken = authToken;

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(PUBLIC_COORDINATOR_SERVICE_URL, {
          extraHeaders: { authorization: authToken }
        });

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected for proof generation');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', reason => {
          console.log('❌ WebSocket disconnected:', reason);
          this.isConnected = false;
        });

        this.socket.on('connect_error', error => {
          console.error('❌ WebSocket connection error:', error);
          this.isConnected = false;

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts: ${error.message}`));
          } else {
            this.reconnectAttempts++;
          }
        });

        this.socket.on('error', error => {
          console.error('❌ WebSocket error:', error);
        });

        // Set connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate proofs using WebSocket connection
   */
  async generateProofs(data: IGenerateProofDto, callbacks: IProofGenerationCallbacks): Promise<IProofGenerationResult> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected. Please establish connection first.');
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      let isResolved = false;
      let latestProofs: IProof[] = [];

      // Set up event listeners
      const onProgress = (progressData: IGenerateProofsBatchData) => {
        console.log(`🔄 Proof generation progress: ${progressData.current}/${progressData.total}`);
        callbacks.onProgress?.(progressData);
      };

      const onMergeFinish = () => {
        console.log('✅ Merge completed via WebSocket');
        callbacks.onMergeComplete?.();
      };

      const onGenerateFinish = (result: { processProofs?: IProof[]; proofs?: IProof[] }) => {
        const proofs = result.processProofs ?? result.proofs ?? [];
        latestProofs = proofs;
        console.log('✅ Proof generation completed successfully');
        callbacks.onGenerationComplete?.({ processProofs: proofs });
      };

      const onSubmitFinish = (result: { tallyData?: ITallyData; processProofs?: IProof[] }) => {
        const tallyData = result.tallyData as ITallyData;
        // Some implementations may also include processProofs on the final event
        if (result.processProofs && (!latestProofs || latestProofs.length === 0)) {
          latestProofs = result.processProofs;
        }
        cleanup();
        if (!isResolved) {
          isResolved = true;
          const finalResult: IProofGenerationResult = {
            processProofs: latestProofs,
            tallyData
          };
          callbacks.onSubmitComplete?.(tallyData);
          callbacks.onComplete?.(finalResult);
          resolve(finalResult);
        }
      };

      const onError = (error: IProofGenerationError) => {
        console.error('❌ Proof generation error:', error);
        cleanup();
        if (!isResolved) {
          isResolved = true;
          callbacks.onError?.(error);
          reject(new Error(error.message));
        }
      };

      let cleanup = () => {
        this.socket?.off(EProofGenerationEvents.PROGRESS, onProgress);
        this.socket?.off(EProofGenerationEvents.MERGE_FINISH, onMergeFinish);
        this.socket?.off(EProofGenerationEvents.GENERATE_FINISH, onGenerateFinish);
        this.socket?.off(EProofGenerationEvents.SUBMIT_FINISH, onSubmitFinish);
        this.socket?.off(EProofGenerationEvents.ERROR, onError);
      };

      // Register event listeners
      this.socket.on(EProofGenerationEvents.PROGRESS, onProgress);
      this.socket.on(EProofGenerationEvents.MERGE_FINISH, onMergeFinish);
      this.socket.on(EProofGenerationEvents.GENERATE_FINISH, onGenerateFinish);
      this.socket.on(EProofGenerationEvents.SUBMIT_FINISH, onSubmitFinish);
      this.socket.on(EProofGenerationEvents.ERROR, onError);

      // Set timeout for proof generation (30 minutes)
      const timeout = setTimeout(
        () => {
          cleanup();
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Proof generation timeout after 30 minutes'));
          }
        },
        30 * 60 * 1000
      );

      // Start proof generation
      try {
        console.log('🚀 Starting proof generation via WebSocket...');
        this.socket.emit(EProofGenerationEvents.START, data);
      } catch (error) {
        cleanup();
        clearTimeout(timeout);
        reject(error);
      }

      // Clear timeout on completion
      const originalCleanup = cleanup;
      cleanup = () => {
        clearTimeout(timeout);
        originalCleanup();
      };
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.authToken = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Reconnect with existing auth token
   */
  async reconnect(): Promise<void> {
    if (!this.authToken) {
      throw new Error('No auth token available for reconnection');
    }

    this.disconnect();
    await this.connect(this.authToken);
  }
}

/**
 * Singleton instance of ProofWebSocketService
 */
export const proofWebSocketService = new ProofWebSocketService();
