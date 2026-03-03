/**
 * IndexedDB utility for storing large artifacts and data
 * Provides a clean interface for database operations with error handling
 */

export interface StorageInfo {
  used: number;
  available: number;
  quota: number;
}

export class IndexedDBStore {
  private dbPromise: Promise<IDBDatabase>;
  private dbName: string;
  private version: number;
  private storeName: string;

  constructor(dbName: string, storeName: string, version: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && !('indexedDB' in window)) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const db = request.result;

        // Handle unexpected close
        db.onclose = () => {
          console.warn('IndexedDB connection closed unexpectedly');
        };

        // Handle version change (e.g., another tab upgraded the DB)
        db.onversionchange = () => {
          db.close();
          console.warn('IndexedDB version changed, closing connection');
        };

        resolve(db);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
          console.log(`Created object store: ${this.storeName}`);
        }
      };

      request.onblocked = () => {
        console.warn('IndexedDB upgrade blocked by another connection');
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onerror = () => {
          console.error('Error reading from IndexedDB:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve(request.result || null);
        };
      });
    } catch (error) {
      console.warn('Error in IndexedDB get operation:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.put(value, key);

        request.onerror = () => {
          console.error('Error writing to IndexedDB:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };

        // Handle transaction errors
        transaction.onerror = () => {
          console.error('Transaction error:', transaction.error);
          reject(transaction.error);
        };

        transaction.onabort = () => {
          console.error('Transaction aborted');
          reject(new Error('Transaction aborted'));
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB set operation:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onerror = () => {
          console.error('Error deleting from IndexedDB:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB delete operation:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onerror = () => {
          console.error('Error clearing IndexedDB:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB clear operation:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<IDBValidKey[]> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();

        request.onerror = () => {
          console.error('Error getting keys from IndexedDB:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    } catch (error) {
      console.warn('Error in IndexedDB getAllKeys operation:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.count();

        request.onerror = () => {
          console.error('Error counting IndexedDB entries:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    } catch (error) {
      console.warn('Error in IndexedDB count operation:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch (error) {
      console.warn('Error checking key existence:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      const db = await this.dbPromise;
      db.close();
    } catch (error) {
      console.warn('Error closing IndexedDB:', error);
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageInfo(): Promise<StorageInfo | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          quota: estimate.quota || 0
        };
      } catch (error) {
        console.warn('Error getting storage estimate:', error);
      }
    }
    return null;
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }
}

// Export convenience functions for common operations
export const createDB = (dbName: string, storeName: string, version?: number) => {
  return new IndexedDBStore(dbName, storeName, version);
};

export const getStorageInfo = async (): Promise<StorageInfo | null> => {
  const db = new IndexedDBStore('temp', 'temp');
  return db.getStorageInfo();
};

export { IndexedDBStore as default };
