/**
 * Public Types
 */

export type { SoundSourceValue } from './domain/value-objects';

export interface PlaybackOptions {
    isLooping?: boolean;
    volume?: number;
    rate?: number;
    positionMillis?: number;
}

export interface SoundState {
    isPlaying: boolean;
    isBuffering: boolean;
    positionMillis: number;
    durationMillis: number;
    volume: number;
    rate: number;
    isLooping: boolean;
    error: string | null;
    currentSource: any;
    currentId: string | null;
}

export type SoundSource = number | { uri: string; headers?: Record<string, string> } | null;
