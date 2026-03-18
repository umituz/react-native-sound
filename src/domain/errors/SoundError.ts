/**
 * Domain Errors for Sound Operations
 */

export enum SoundErrorCode {
    INVALID_SOUND_ID = 'INVALID_SOUND_ID',
    INVALID_SOUND_SOURCE = 'INVALID_SOUND_SOURCE',
    PLAYBACK_FAILED = 'PLAYBACK_FAILED',
    SOUND_NOT_LOADED = 'SOUND_NOT_LOADED',
    INVALID_POSITION = 'INVALID_POSITION',
    CACHE_ERROR = 'CACHE_ERROR',
}

export class SoundError extends Error {
    constructor(
        public readonly code: SoundErrorCode,
        message: string,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'SoundError';
    }

    static invalidSoundId(): SoundError {
        return new SoundError(SoundErrorCode.INVALID_SOUND_ID, 'Sound id must be a non-empty string');
    }

    static invalidSoundSource(): SoundError {
        return new SoundError(SoundErrorCode.INVALID_SOUND_SOURCE, 'Sound source cannot be null or undefined');
    }

    static playbackFailed(error: unknown): SoundError {
        const message = error instanceof Error ? error.message : 'Unknown playback error';
        return new SoundError(SoundErrorCode.PLAYBACK_FAILED, message, error);
    }

    static soundNotLoaded(): SoundError {
        return new SoundError(SoundErrorCode.SOUND_NOT_LOADED, 'Sound is not loaded');
    }

    static invalidPosition(): SoundError {
        return new SoundError(SoundErrorCode.INVALID_POSITION, 'Position must be a finite number');
    }
}
