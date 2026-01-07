/**
 * @umituz/react-native-sound Types
 */

import { AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

export type SoundSource = number | { uri: string; headers?: Record<string, string> } | null;

export interface PlaybackOptions {
    shouldPlay?: boolean;
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
    error: string | null;
    currentSource: SoundSource | null;
    currentId: string | null;
}

export type PlaybackStatus = AVPlaybackStatus;

export interface SoundError {
    message: string;
    code?: string;
    originalError?: unknown;
}

export type PlaybackStatusSuccess = AVPlaybackStatusSuccess;

export function isPlaybackStatusSuccess(status: AVPlaybackStatus): status is PlaybackStatusSuccess {
    return status.isLoaded;
}

export function isSoundSourceValid(source: SoundSource): source is number | { uri: string; headers?: Record<string, string> } {
    return source !== null && source !== undefined;
}

export function validateVolume(volume: number): boolean {
    return typeof volume === 'number' && volume >= 0 && volume <= 1;
}

export function validateRate(rate: number): boolean {
    return typeof rate === 'number' && rate >= 0.5 && rate <= 2.0;
}

export function clampVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
}

export function clampRate(rate: number): number {
    return Math.max(0.5, Math.min(2.0, rate));
}
