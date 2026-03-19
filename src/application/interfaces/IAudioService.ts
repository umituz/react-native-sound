/**
 * Audio Service Interface
 */

import type { AVPlaybackStatus } from 'expo-av';
import type { SoundSourceValue } from '../../domain/value-objects';

export interface PlaybackStatus {
    isLoaded: boolean;
    isPlaying: boolean;
    isBuffering: boolean;
    positionMillis: number;
    durationMillis: number;
    rate?: number;
    isLooping: boolean;
    didJustFinish: boolean;
    error?: string;
}

export interface PlaybackOptions {
    shouldPlay: boolean;
    isLooping: boolean;
    volume: number;
    rate: number;
    positionMillis?: number;
}

export interface IAudioService {
    createSound(
        source: SoundSourceValue,
        options: PlaybackOptions,
        onStatusUpdate: (status: PlaybackStatus) => void
    ): Promise<{ sound: unknown }>;
    play(sound: unknown): Promise<void>;
    pause(sound: unknown): Promise<void>;
    stop(sound: unknown): Promise<void>;
    unload(sound: unknown): Promise<void>;
    setVolume(sound: unknown, volume: number): Promise<void>;
    setRate(sound: unknown, rate: number): Promise<void>;
    setPosition(sound: unknown, positionMillis: number): Promise<void>;
    getStatus(sound: unknown): Promise<PlaybackStatus | null>;
}
