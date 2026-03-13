/**
 * @umituz/react-native-sound Types
 */

import { AVPlaybackStatus } from 'expo-av';

export type SoundSource = number | { uri: string; headers?: Record<string, string> } | null;

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
    currentSource: SoundSource | null;
    currentId: string | null;
}
