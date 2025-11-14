/**
 * useSoundPlayback Hook
 *
 * React hook for sound playback.
 * Provides easy access to sound playback functionality.
 * SOLID: Single Responsibility - Only provides playback interface
 * KISS: Simple hook wrapper around store
 */

import { useEffect } from 'react';
import { useSoundPlaybackStore } from '../../infrastructure/storage/SoundPlaybackStore';
import { audioPlaybackService } from '../../infrastructure/services/AudioPlaybackService';
import type { Sound, SoundPlaybackOptions } from '../../domain/entities/Sound.entity';
import type { IStorageService } from '../../domain/repositories/IStorageService';
import { SoundSourceResolver } from '../../infrastructure/services/SoundSourceResolver';

export interface UseSoundPlaybackOptions {
  /** Storage service for remote sound URLs (optional) */
  storageService?: IStorageService;

  /** Auto-configure audio session on mount */
  autoConfigureAudioSession?: boolean;

  /** Audio session configuration options */
  audioSessionOptions?: {
    playsInSilentModeIOS?: boolean;
    allowsRecordingIOS?: boolean;
    staysActiveInBackground?: boolean;
  };
}

export function useSoundPlayback(options: UseSoundPlaybackOptions = {}) {
  const store = useSoundPlaybackStore();

  // Auto-configure audio session
  useEffect(() => {
    if (options.autoConfigureAudioSession !== false) {
      audioPlaybackService.configureAudioSession(
        options.audioSessionOptions
      );
    }
  }, [options.autoConfigureAudioSession, options.audioSessionOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      store.cleanup();
    };
  }, [store]);

  /**
   * Play a sound
   */
  const playSound = async (
    sound: Sound,
    playbackOptions?: SoundPlaybackOptions,
    onDownloadProgress?: (progress: number) => void
  ) => {
    // Create resolver with storage service
    const resolver = new SoundSourceResolver(options.storageService);

    // Progress callback wrapper
    const progressCallback = onDownloadProgress
      ? (progress: number) => {
          useSoundPlaybackStore.setState({
            downloadingSoundId: sound.id,
            downloadProgress: Math.round(progress * 100),
          });
          onDownloadProgress(progress);
        }
      : undefined;

    // Resolve source
    const resolved = await resolver.resolve(sound, progressCallback);
    if (!resolved) {
      throw new Error(`Cannot resolve audio source for sound: ${sound.id}`);
    }

    // Pass resolved source to store via metadata
    const soundWithSource: Sound = {
      ...sound,
      metadata: {
        ...sound.metadata,
        _resolvedSource: resolved.source,
        _isStreaming: resolved.isStreaming,
      },
    };

    await store.playSound(soundWithSource, playbackOptions, onDownloadProgress);
  };

  return {
    /** Play a sound */
    playSound,

    /** Stop current sound */
    stopSound: store.stopSound,

    /** Pause current sound */
    pauseSound: store.pauseSound,

    /** Resume paused sound */
    resumeSound: store.resumeSound,

    /** Check if specific sound is playing */
    isPlaying: store.isPlaying,

    /** Currently playing sound ID */
    playingSoundId: store.playingSoundId,

    /** Currently downloading sound ID */
    downloadingSoundId: store.downloadingSoundId,

    /** Download progress (0-100) */
    downloadProgress: store.downloadProgress,

    /** Whether sound is streaming */
    isStreaming: store.isStreaming,
  };
}

