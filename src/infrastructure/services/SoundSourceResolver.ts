/**
 * Sound Source Resolver
 *
 * Resolves sound source from Sound entity to AudioSource.
 * Handles local assets, cached files, and remote URLs.
 * SOLID: Single Responsibility - Only resolves audio sources
 * DRY: Centralized source resolution logic
 */

import type { Sound, AudioSource } from '../../domain/entities/Sound.entity';
import type { IStorageService } from '../../domain/repositories/IStorageService';
import { soundCacheService } from './SoundCacheService';

export interface ResolvedAudioSource {
  source: AudioSource;
  isStreaming: boolean;
}

export class SoundSourceResolver {
  constructor(private storageService?: IStorageService) {}

  /**
   * Resolve sound to audio source
   * Handles: local assets, cached files, remote URLs
   *
   * @param sound - Sound entity
   * @param onDownloadProgress - Optional download progress callback
   * @returns Resolved audio source or null if cannot resolve
   */
  async resolve(
    sound: Sound,
    onDownloadProgress?: (progress: number) => void
  ): Promise<ResolvedAudioSource | null> {
    // 1. Local asset (bundled in app)
    if (sound.localAsset !== undefined) {
      return {
        source: sound.localAsset,
        isStreaming: false,
      };
    }

    // 2. Remote storage URL
    if (sound.storageUrl && sound.filename) {
      // Check cache first
      const cachedUri = await soundCacheService.getCachedSound(sound.filename);
      if (cachedUri) {
        return {
          source: { uri: cachedUri },
          isStreaming: false,
        };
      }

      // Get download URL from storage service
      if (this.storageService) {
        try {
          const downloadUrl = await this.storageService.getDownloadUrl(
            sound.storageUrl
          );

          // Start background download
          soundCacheService
            .downloadAndCache(downloadUrl, sound.filename, onDownloadProgress)
            .catch(() => {
              // Silent fail - background download
            });

          // Return streaming URL immediately
          return {
            source: { uri: downloadUrl },
            isStreaming: true,
          };
        } catch {
          // Storage service error - return null
          return null;
        }
      }

      // No storage service - assume storageUrl is direct URL
      return {
        source: { uri: sound.storageUrl },
        isStreaming: true,
      };
    }

    // 3. Direct URI (if storageUrl is already a full URL)
    if (sound.storageUrl && sound.storageUrl.startsWith('http')) {
      return {
        source: { uri: sound.storageUrl },
        isStreaming: true,
      };
    }

    // Cannot resolve
    return null;
  }
}

