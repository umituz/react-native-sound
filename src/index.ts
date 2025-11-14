/**
 * @umituz/react-native-sound - Public API
 *
 * Universal sound playback and caching library for React Native apps.
 * Supports local assets, remote URLs, and automatic caching.
 *
 * Usage:
 *   import { useSoundPlayback, useSoundCache, Sound } from '@umituz/react-native-sound';
 */

// =============================================================================
// DOMAIN LAYER - Entities
// =============================================================================

export type {
  Sound,
  AudioSource,
  SoundPlaybackOptions,
  SoundCacheInfo,
} from './domain/entities/Sound.entity';

// =============================================================================
// DOMAIN LAYER - Repository Interface
// =============================================================================

export type { IStorageService } from './domain/repositories/IStorageService';

// =============================================================================
// INFRASTRUCTURE LAYER - Services
// =============================================================================

export {
  SoundCacheService,
  soundCacheService,
} from './infrastructure/services/SoundCacheService';

export {
  AudioPlaybackService,
  audioPlaybackService,
} from './infrastructure/services/AudioPlaybackService';

export {
  SoundSourceResolver,
} from './infrastructure/services/SoundSourceResolver';

export type { ResolvedAudioSource } from './infrastructure/services/SoundSourceResolver';

// =============================================================================
// INFRASTRUCTURE LAYER - Storage
// =============================================================================

export {
  useSoundPlaybackStore,
} from './infrastructure/storage/SoundPlaybackStore';

export type { SoundPlaybackState } from './infrastructure/storage/SoundPlaybackStore';

// =============================================================================
// PRESENTATION LAYER - Hooks
// =============================================================================

export {
  useSoundPlayback,
} from './presentation/hooks/useSoundPlayback';

export type { UseSoundPlaybackOptions } from './presentation/hooks/useSoundPlayback';

export {
  useSoundCache,
} from './presentation/hooks/useSoundCache';

export type { UseSoundCacheResult } from './presentation/hooks/useSoundCache';

