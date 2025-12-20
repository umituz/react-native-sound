/**
 * @umituz/react-native-sound Types
 */

import { AVPlaybackStatus } from 'expo-av';

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
