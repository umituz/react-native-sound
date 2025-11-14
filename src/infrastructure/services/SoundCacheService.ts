/**
 * Sound Cache Service
 *
 * Handles local file caching for remote sounds.
 * SOLID: Single Responsibility - Only handles file caching
 * DRY: Centralized caching logic
 * KISS: Simple file operations
 */

import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.cacheDirectory}sounds/`;

export class SoundCacheService {
  /**
   * Ensure cache directory exists
   * KISS: Simple directory creation
   */
  async ensureCacheDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  }

  /**
   * Get cached sound file URI
   * @param filename - Sound filename (e.g., "ocean-waves.mp3")
   * @returns Local file URI if cached, null otherwise
   */
  async getCachedSound(filename: string): Promise<string | null> {
    await this.ensureCacheDir();

    const localUri = `${CACHE_DIR}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(localUri);

    if (fileInfo.exists) {
      return localUri;
    }

    return null;
  }

  /**
   * Download and cache sound from remote URL
   * @param remoteUrl - Remote download URL
   * @param filename - Local filename for caching
   * @param onProgress - Optional progress callback (0-1)
   * @returns Local file URI of cached sound
   */
  async downloadAndCache(
    remoteUrl: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    await this.ensureCacheDir();

    // Check cache first (DRY: Reuse existing function)
    const cached = await this.getCachedSound(filename);
    if (cached) {
      return cached;
    }

    const localUri = `${CACHE_DIR}${filename}`;

    // Download with progress tracking
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      localUri,
      {},
      downloadProgress => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;

        onProgress?.(progress);
      }
    );

    const result = await downloadResumable.downloadAsync();

    if (!result) {
      throw new Error('Download failed');
    }

    return result.uri;
  }

  /**
   * Clear all cached sounds
   * Useful for cleanup or cache management
   */
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      await this.ensureCacheDir();
    } catch {
      // Silently fail - cache clearing is non-critical
    }
  }

  /**
   * Get cache size in MB
   * @returns Cache size in megabytes
   */
  async getCacheSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        return 0;
      }

      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size || 0;
        }
      }

      // Convert to MB
      return totalSize / (1024 * 1024);
    } catch {
      return 0;
    }
  }

  /**
   * Delete specific cached sound
   * @param filename - Filename to delete
   */
  async deleteCachedSound(filename: string): Promise<void> {
    try {
      const localUri = `${CACHE_DIR}${filename}`;
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    } catch {
      // Silently fail
    }
  }
}

// Export singleton instance
export const soundCacheService = new SoundCacheService();

