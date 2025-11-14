/**
 * useSoundCache Hook
 *
 * React hook for sound cache management.
 * Provides cache operations and statistics.
 * SOLID: Single Responsibility - Only handles cache operations
 * KISS: Simple hook wrapper around cache service
 */

import { useState, useEffect, useCallback } from 'react';
import { soundCacheService } from '../../infrastructure/services/SoundCacheService';
import type { Sound } from '../../domain/entities/Sound.entity';

export interface UseSoundCacheResult {
  /** Check if sound is cached */
  isCached: (sound: Sound) => Promise<boolean>;

  /** Get cached sound URI */
  getCachedUri: (sound: Sound) => Promise<string | null>;

  /** Clear all cache */
  clearCache: () => Promise<void>;

  /** Get cache size in MB */
  getCacheSize: () => Promise<number>;

  /** Delete specific cached sound */
  deleteCachedSound: (sound: Sound) => Promise<void>;

  /** Current cache size in MB */
  cacheSize: number;

  /** Whether cache size is loading */
  isLoadingCacheSize: boolean;

  /** Refresh cache size */
  refreshCacheSize: () => Promise<void>;
}

export function useSoundCache(): UseSoundCacheResult {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isLoadingCacheSize, setIsLoadingCacheSize] = useState(false);

  // Load cache size on mount
  useEffect(() => {
    refreshCacheSize();
  }, []);

  const refreshCacheSize = useCallback(async () => {
    setIsLoadingCacheSize(true);
    try {
      const size = await soundCacheService.getCacheSize();
      setCacheSize(size);
    } catch {
      // Silently fail
    } finally {
      setIsLoadingCacheSize(false);
    }
  }, []);

  const isCached = useCallback(
    async (sound: Sound): Promise<boolean> => {
      if (!sound.filename) {
        return false;
      }
      const cachedUri = await soundCacheService.getCachedSound(sound.filename);
      return cachedUri !== null;
    },
    []
  );

  const getCachedUri = useCallback(
    async (sound: Sound): Promise<string | null> => {
      if (!sound.filename) {
        return null;
      }
      return soundCacheService.getCachedSound(sound.filename);
    },
    []
  );

  const clearCache = useCallback(async () => {
    await soundCacheService.clearCache();
    await refreshCacheSize();
  }, [refreshCacheSize]);

  const deleteCachedSound = useCallback(
    async (sound: Sound) => {
      if (!sound.filename) {
        return;
      }
      await soundCacheService.deleteCachedSound(sound.filename);
      await refreshCacheSize();
    },
    [refreshCacheSize]
  );

  return {
    isCached,
    getCachedUri,
    clearCache,
    getCacheSize: refreshCacheSize,
    deleteCachedSound,
    cacheSize,
    isLoadingCacheSize,
    refreshCacheSize,
  };
}

