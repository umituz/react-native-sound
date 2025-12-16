/**
 * Sound Playback Store
 *
 * Global state management for sound playback.
 * Ensures only one sound plays at a time (singleton pattern).
 * SOLID: Single Responsibility - Only manages playback state
 * KISS: Simple Zustand store
 */

import { create } from 'zustand';
import { Audio } from 'expo-av';
import type {
  Sound,
  SoundPlaybackOptions,
  AudioSource,
} from '../../domain/entities/Sound.entity';

export interface SoundPlaybackState {
  /** Currently playing sound ID */
  playingSoundId: string | null;

  /** Currently downloading sound ID */
  downloadingSoundId: string | null;

  /** Download progress (0-100) */
  downloadProgress: number;

  /** Whether sound is streaming */
  isStreaming: boolean;

  /** Internal Audio.Sound instance */
  _sound: Audio.Sound | null;

  /** Play a sound */
  playSound: (
    sound: Sound,
    options?: SoundPlaybackOptions,
    onDownloadProgress?: (progress: number) => void
  ) => Promise<void>;

  /** Stop current sound */
  stopSound: () => Promise<void>;

  /** Pause current sound */
  pauseSound: () => Promise<void>;

  /** Resume paused sound */
  resumeSound: () => Promise<void>;

  /** Check if specific sound is playing */
  isPlaying: (soundId: string) => boolean;

  /** Cleanup all resources */
  cleanup: () => Promise<void>;
}

export const useSoundPlaybackStore = create<SoundPlaybackState>((set, get) => ({
  // Initial state
  playingSoundId: null,
  downloadingSoundId: null,
  downloadProgress: 0,
  isStreaming: false,
  _sound: null,

  // Play sound
  playSound: async (
    sound: Sound,
    options: SoundPlaybackOptions = {},
    onDownloadProgress?: (progress: number) => void
  ) => {
    const state = get();

    // Toggle: If same sound is playing, stop it
    if (state.playingSoundId === sound.id && state._sound) {
      await get().stopSound();
      return;
    }

    try {
      // Stop any existing sound
      if (state._sound) {
        await state._sound.unloadAsync();
        set({ _sound: null });
      }

      // Optimistic update
      set({ playingSoundId: sound.id });

      // Check if source is pre-resolved (from hook)
      let resolvedSource: { source: AudioSource; isStreaming: boolean } | null =
        null;

      if (
        sound.metadata &&
        '_resolvedSource' in sound.metadata &&
        '_isStreaming' in sound.metadata
      ) {
        // Use pre-resolved source from hook
        resolvedSource = {
          source: sound.metadata._resolvedSource as AudioSource,
          isStreaming: sound.metadata._isStreaming as boolean,
        };
      } else {
        // Import services dynamically to avoid circular dependencies
        const { SoundSourceResolver } = await import(
          '../services/SoundSourceResolver'
        );

        // Create resolver (no storage service in store - app should use hook)
        const resolver = new SoundSourceResolver();

        // Resolve audio source
        resolvedSource = await resolver.resolve(sound, progress => {
          set({
            downloadingSoundId: sound.id,
            downloadProgress: Math.round(progress * 100),
          });
          onDownloadProgress?.(progress);
        });
      }

      if (!resolvedSource) {
        throw new Error(`Cannot resolve audio source for sound: ${sound.id}`);
      }

      set({
        isStreaming: resolvedSource.isStreaming,
        downloadingSoundId: null,
        downloadProgress: 0,
      });

      // Import audio service
      const { audioPlaybackService } = await import(
        '../services/AudioPlaybackService'
      );

      // Load and play sound
      const audioSound = await audioPlaybackService.loadSound(
        resolvedSource.source,
        {
          ...options,
          shouldPlay: true,
        }
      );

      set({ _sound: audioSound });
    } catch (error) {
      // Rollback on error
      set({
        playingSoundId: null,
        _sound: null,
        downloadingSoundId: null,
        downloadProgress: 0,
        isStreaming: false,
      });
      throw error;
    }
  },

  // Stop sound
  stopSound: async () => {
    const state = get();

    if (!state._sound && !state.playingSoundId) {
      return;
    }

    set({
      playingSoundId: null,
      downloadingSoundId: null,
      downloadProgress: 0,
      isStreaming: false,
    });

    if (state._sound) {
      try {
        await state._sound.unloadAsync();
      } catch {
        // Silently fail
      }
      set({ _sound: null });
    }
  },

  // Pause sound
  pauseSound: async () => {
    const state = get();

    if (!state._sound) {
      return;
    }

    try {
      await state._sound.pauseAsync();
    } catch {
      // Silently fail
    }
  },

  // Resume sound
  resumeSound: async () => {
    const state = get();

    if (!state._sound) {
      return;
    }

    try {
      await state._sound.playAsync();
    } catch {
      // Silently fail
    }
  },

  // Check if playing
  isPlaying: (soundId: string) => {
    return get().playingSoundId === soundId;
  },

  // Cleanup
  cleanup: async () => {
    const state = get();

    try {
      if (state._sound) {
        await state._sound.unloadAsync();
      }

      set({
        playingSoundId: null,
        downloadingSoundId: null,
        downloadProgress: 0,
        isStreaming: false,
        _sound: null,
      });
    } catch {
      // Silently fail
    }
  },
}));

