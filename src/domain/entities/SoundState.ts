/**
 * Sound State Entity
 */

import { SoundSource } from '../value-objects/SoundSource';
import { Volume } from '../value-objects/Volume';
import { Rate } from '../value-objects/Rate';

export interface SoundStateData {
    isPlaying: boolean;
    isBuffering: boolean;
    positionMillis: number;
    durationMillis: number;
    volume: number;
    rate: number;
    isLooping: boolean;
    error: string | null;
    currentSource: SoundSource | null;
    currentId: string | null;
}

export class SoundState {
    constructor(private data: SoundStateData) {}

    isPlaying(): boolean {
        return this.data.isPlaying;
    }

    isBuffering(): boolean {
        return this.data.isBuffering;
    }

    getPosition(): number {
        return this.data.positionMillis;
    }

    getDuration(): number {
        return this.data.durationMillis;
    }

    getVolume(): number {
        return this.data.volume;
    }

    getRate(): number {
        return this.data.rate;
    }

    isLooping(): boolean {
        return this.data.isLooping;
    }

    getError(): string | null {
        return this.data.error;
    }

    getCurrentSource(): SoundSource | null {
        return this.data.currentSource;
    }

    getCurrentId(): string | null {
        return this.data.currentId;
    }

    toData(): SoundStateData {
        return { ...this.data };
    }

    static createEmpty(): SoundState {
        return new SoundState({
            isPlaying: false,
            isBuffering: false,
            positionMillis: 0,
            durationMillis: 0,
            volume: 1.0,
            rate: 1.0,
            isLooping: false,
            error: null,
            currentSource: null,
            currentId: null,
        });
    }
}
