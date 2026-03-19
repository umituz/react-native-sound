/**
 * @umituz/react-native-sound
 * DDD-based audio management for React Native
 * Optimized architecture with minimal code duplication
 */

// ===== Public API =====
export { useSound } from './presentation/useSound';
export { useSoundStore, setupEventListeners } from './presentation/SoundStore';

// ===== Types =====
export type { PlaybackOptions, SoundState, SoundSource } from './types';
export type { PlaybackStatus, PlaybackOptions as ServicePlaybackOptions } from './application/interfaces/IAudioService';
export type { CachedSound, ISoundCache } from './application/interfaces/ISoundCache';

// ===== Domain (Advanced Usage) =====
export { SoundError, SoundErrorCode } from './domain/errors/SoundError';
export {
    SoundId,
    SoundSource as SoundSourceVO,
    Volume,
    Rate,
    PlaybackPosition,
    SoundValueObjects,
    type SoundSourceValue,
} from './domain/value-objects';

// ===== Infrastructure (Testing/Customization) =====
export { Logger } from './infrastructure/Logger';
export { AudioConfig } from './infrastructure/AudioConfig';
export { AudioRepository } from './infrastructure/AudioRepository';

// ===== Application (Testing/Customization) =====
export { SoundService } from './application/SoundService';
export { SoundCommandProcessor, type SoundCommand, type PlayCommand, type PreloadCommand } from './application/SoundCommands';
export { SoundEvents, type SoundEvent, type PlaybackStartedEvent } from './application/SoundEvents';

// ===== Utilities =====
export {
    clampVolume,
    clampRate,
    validateSoundId,
    isSoundSourceValid,
    isPlaybackStatusSuccess,
    debounce,
    throttle,
    RateLimiter,
    PeriodicTask,
    AutoGCWeakCache,
} from './utils';
