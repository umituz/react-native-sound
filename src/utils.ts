/**
 * @umituz/react-native-sound Utility Functions
 */

import { AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import type { SoundSource } from './types';

type PlaybackStatusSuccess = AVPlaybackStatusSuccess;

export function isPlaybackStatusSuccess(status: AVPlaybackStatus): status is PlaybackStatusSuccess {
    return status.isLoaded;
}

export function isSoundSourceValid(source: SoundSource): source is number | { uri: string; headers?: Record<string, string> } {
    return source !== null && source !== undefined;
}

export function clampVolume(volume: number): number {
    if (!Number.isFinite(volume)) return 1.0;
    return Math.max(0, Math.min(1, volume));
}

export function clampRate(rate: number): number {
    if (!Number.isFinite(rate)) return 1.0;
    return Math.max(0.5, Math.min(2.0, rate));
}

export function validateSoundId(id: string): boolean {
    return typeof id === 'string' && id.trim().length > 0;
}
