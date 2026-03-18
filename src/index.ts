/**
 * @umituz/react-native-sound
 * DDD-based audio management for React Native
 */

// Public API
export { useSound } from './presentation/hooks/useSound';
export { useSoundStore } from './presentation/store';

// Types
export type { PlaybackOptions, SoundState, SoundSource } from './types';

// Utilities (backward compatibility)
export {
    clampVolume,
    clampRate,
    validateSoundId,
    isSoundSourceValid,
    isPlaybackStatusSuccess,
} from './utils';

// Domain exports (for advanced usage)
export { SoundError } from './domain/errors/SoundError';
export { SoundId } from './domain/value-objects/SoundId';
export { SoundSource as SoundSourceVO } from './domain/value-objects/SoundSource';
export { Volume } from './domain/value-objects/Volume';
export { Rate } from './domain/value-objects/Rate';
export { PlaybackPosition } from './domain/value-objects/PlaybackPosition';
export { SoundState as SoundStateEntity } from './domain/entities/SoundState';

// Infrastructure exports (for testing/customization)
export { Logger } from './infrastructure/Logger';
export { AudioConfig } from './infrastructure/AudioConfig';
export { ExpoAudioService } from './infrastructure/ExpoAudioService';
export { SoundCache } from './infrastructure/SoundCache';

// Application exports (for testing/customization)
export { SoundServiceFacade } from './application/SoundServiceFacade';
export type { IAudioService, PlaybackStatus } from './application/interfaces/IAudioService';
export type { ISoundCache, CachedSound } from './application/interfaces/ISoundCache';
export { SoundPresenter } from './application/presenters/SoundPresenter';
