import { ONE_HOUR_MS } from '@/utils/constants';
import { IndexedDBStore } from '@/utils/indexedDB';
import { downloadPollJoiningArtifactsBrowser, type IPollJoiningArtifacts } from '@maci-protocol/sdk/browser';
import { useCallback, useEffect, useRef, useState } from 'react';

// Cache configuration
const DB_NAME = 'PrivoteArtifacts';
const STORE_NAME = 'artifacts';
const ARTIFACTS_KEY = 'poll_joining_artifacts' + (process.env.NEXT_PUBLIC_ARTIFACTS_KEY ?? 'test');
const ARTIFACTS_VERSION = '1.0.0';
const CACHE_EXPIRY_HOURS = 24;

interface CachedArtifacts {
  artifacts: IPollJoiningArtifacts;
  version: string;
  timestamp: number;
}

interface UsePollArtifactsReturn {
  artifacts: IPollJoiningArtifacts | undefined;
  isLoading: boolean;
  error: string | null;
  clearCache: () => Promise<void>;
  refetch: () => Promise<void>;
  loadArtifacts: () => Promise<IPollJoiningArtifacts | undefined>;
  storageInfo: {
    isSupported: boolean;
    size?: string;
    available?: string;
  };
}

// Create a singleton instance
let artifactsDB: IndexedDBStore | null = null;

const getDB = () => {
  if (!artifactsDB) {
    artifactsDB = new IndexedDBStore(DB_NAME, STORE_NAME, 1);
  }
  return artifactsDB;
};

const usePollArtifacts = (autoLoad: boolean = true): UsePollArtifactsReturn => {
  const [artifacts, setArtifacts] = useState<IPollJoiningArtifacts | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<{
    isSupported: boolean;
    size?: string;
    available?: string;
  }>({
    isSupported: IndexedDBStore.isSupported()
  });

  // Update storage info
  const updateStorageInfo = useCallback(async () => {
    if (!IndexedDBStore.isSupported()) {
      setStorageInfo({ isSupported: false });
      return;
    }

    try {
      const db = getDB();
      const info = await db.getStorageInfo();
      if (info) {
        setStorageInfo({
          isSupported: true,
          size: IndexedDBStore.formatBytes(info.used),
          available: IndexedDBStore.formatBytes(info.available)
        });
      }
    } catch (error) {
      console.warn('Error getting storage info:', error);
    }
  }, []);

  // Cache management functions
  const getCachedArtifacts = useCallback(async (): Promise<CachedArtifacts | null> => {
    if (!IndexedDBStore.isSupported()) {
      console.warn('IndexedDB not supported, falling back to download');
      return null;
    }

    try {
      const db = getDB();
      const cached = await db.get<CachedArtifacts>(ARTIFACTS_KEY);

      if (!cached) return null;

      // Check version
      if (cached.version !== ARTIFACTS_VERSION) {
        console.log('Artifacts version mismatch, clearing cache');
        await db.delete(ARTIFACTS_KEY);
        return null;
      }

      // Check expiry
      const now = Date.now();
      const expiryTime = cached.timestamp + CACHE_EXPIRY_HOURS * ONE_HOUR_MS;
      if (now > expiryTime) {
        console.log('Cached artifacts expired, clearing cache');
        await db.delete(ARTIFACTS_KEY);
        return null;
      }

      return cached;
    } catch (error) {
      console.warn('Error reading cached artifacts from IndexedDB:', error);
      return null;
    }
  }, []);

  const setCachedArtifacts = useCallback(
    async (artifacts: IPollJoiningArtifacts) => {
      if (!IndexedDBStore.isSupported()) {
        console.warn('IndexedDB not supported, skipping cache');
        return;
      }

      try {
        const cacheData: CachedArtifacts = {
          artifacts,
          version: ARTIFACTS_VERSION,
          timestamp: Date.now()
        };

        const db = getDB();
        await db.set(ARTIFACTS_KEY, cacheData);
        console.log('Artifacts successfully cached in IndexedDB');

        // Update storage info after caching
        await updateStorageInfo();
      } catch (error) {
        console.warn('Error caching artifacts in IndexedDB:', error);
        // Don't throw error here, as the app can still function without caching
      }
    },
    [updateStorageInfo]
  );

  const downloadArtifacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Downloading fresh poll joining artifacts');
      const downloadedArtifacts = await downloadPollJoiningArtifactsBrowser({
        testing: process.env.NEXT_PUBLIC_ARTIFACTS_TYPE === 'test',
        stateTreeDepth: Number(process.env.NEXT_PUBLIC_ARTIFACTS_STATE_TREE_DEPTH ?? 10)
      });

      setArtifacts(() => downloadedArtifacts);

      // Try to cache the artifacts (non-blocking)
      setCachedArtifacts(downloadedArtifacts).catch(err => {
        console.warn('Failed to cache artifacts, but continuing:', err);
      });

      return downloadedArtifacts;
    } catch (err) {
      const errorMessage = 'Failed to download poll joining artifacts';
      console.error(errorMessage, err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setCachedArtifacts]);

  // Tracks an in-flight loadArtifacts call so concurrent callers get the same promise
  // instead of a silent `undefined` return.
  const loadingPromiseRef = useRef<Promise<IPollJoiningArtifacts | undefined> | null>(null);

  const loadArtifacts = useCallback(async (): Promise<IPollJoiningArtifacts | undefined> => {
    // If a load is already in progress, return that same promise so the caller
    // can await the result rather than receiving undefined.
    if (loadingPromiseRef.current) {
      console.log('Already loading artifacts, awaiting in-progress load');
      return loadingPromiseRef.current;
    }

    setIsLoading(true);
    setError(null);

    const promise = (async (): Promise<IPollJoiningArtifacts | undefined> => {
      try {
        // Try to get from cache first
        const cachedData = await getCachedArtifacts();
        if (cachedData) {
          console.log('Using cached poll joining artifacts from IndexedDB');
          setArtifacts(() => cachedData.artifacts);
          return cachedData.artifacts;
        }

        // Download fresh artifacts if not cached
        console.log('No cached artifacts found, downloading fresh ones');
        return await downloadArtifacts();
      } catch (err) {
        const errorMessage = 'Failed to load poll joining artifacts';
        console.error(errorMessage, err);
        setError(errorMessage);
        return undefined;
      } finally {
        setIsLoading(false);
        loadingPromiseRef.current = null;
      }
    })();

    loadingPromiseRef.current = promise;
    return promise;
  }, [getCachedArtifacts, downloadArtifacts]);

  const clearCache = useCallback(async () => {
    if (!IndexedDBStore.isSupported()) {
      console.warn('IndexedDB not supported');
      setArtifacts(undefined);
      return;
    }

    try {
      const db = getDB();
      await db.delete(ARTIFACTS_KEY);
      setArtifacts(undefined);
      console.log('Artifacts cache cleared');

      // Update storage info after clearing
      await updateStorageInfo();
    } catch (error) {
      console.warn('Error clearing artifacts cache:', error);
      // Still clear the in-memory artifacts even if DB operation failed
      setArtifacts(undefined);
    }
  }, [updateStorageInfo]);

  const refetch = useCallback(async () => {
    await clearCache();
    await downloadArtifacts();
  }, [clearCache, downloadArtifacts]);

  // Load artifacts on mount only if autoLoad is true.
  // loadArtifacts now handles concurrent calls via a ref, so isLoading is not needed here.
  useEffect(() => {
    if (autoLoad && !artifacts) {
      loadArtifacts();
    }
  }, [autoLoad, artifacts, loadArtifacts]);

  // Initialize storage info on mount
  useEffect(() => {
    updateStorageInfo();
  }, [updateStorageInfo]);

  return {
    artifacts,
    isLoading,
    error,
    clearCache,
    refetch,
    loadArtifacts,
    storageInfo
  };
};

export default usePollArtifacts;
