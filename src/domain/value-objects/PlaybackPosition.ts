/**
 * Playback Position Value Object
 */

import { SoundError } from '../errors/SoundError';

export class PlaybackPosition {
    private readonly value: number;
    private readonly duration?: number;

    constructor(value: number, duration?: number) {
        if (!Number.isFinite(value)) {
            throw SoundError.invalidPosition();
        }
        this.value = duration ? this.clamp(value, duration) : value;
        this.duration = duration;
    }

    private clamp(value: number, max: number): number {
        return Math.max(0, Math.min(max, value));
    }

    getValue(): number {
        return this.value;
    }

    getDuration(): number | undefined {
        return this.duration;
    }
}
