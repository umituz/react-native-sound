/**
 * Expo Audio Service Implementation
 */

import { Audio } from 'expo-av';
import type { IAudioService, PlaybackOptions, PlaybackStatus } from '../application/interfaces/IAudioService';
import { SoundSourceValue } from '../domain/value-objects/SoundSource';
import { Logger } from './Logger';

export class ExpoAudioService implements IAudioService {
    async createSound(
        source: SoundSourceValue,
        options: PlaybackOptions,
        onStatusUpdate: (status: PlaybackStatus) => void
    ): Promise<{ sound: Audio.Sound }> {
        const { sound } = await Audio.Sound.createAsync(
            source,
            {
                shouldPlay: options.shouldPlay,
                isLooping: options.isLooping,
                volume: options.volume,
                rate: options.rate,
                positionMillis: options.positionMillis,
            },
            (status) => onStatusUpdate(this.mapStatus(status))
        );
        Logger.debug('Sound created');
        return { sound };
    }

    async play(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).playAsync();
    }

    async pause(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).pauseAsync();
    }

    async stop(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).stopAsync();
    }

    async unload(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).unloadAsync();
    }

    async setVolume(sound: unknown, volume: number): Promise<void> {
        await (sound as Audio.Sound).setVolumeAsync(volume);
    }

    async setRate(sound: unknown, rate: number): Promise<void> {
        await (sound as Audio.Sound).setRateAsync(rate, false);
    }

    async setPosition(sound: unknown, positionMillis: number): Promise<void> {
        await (sound as Audio.Sound).setStatusAsync({ positionMillis });
    }

    async getStatus(sound: unknown): Promise<PlaybackStatus | null> {
        const status = await (sound as Audio.Sound).getStatusAsync();
        return status.isLoaded ? this.mapStatus(status) : null;
    }

    private mapStatus(status: { isLoaded: boolean } & any): PlaybackStatus {
        if (!status.isLoaded) {
            return {
                isLoaded: false,
                isPlaying: false,
                isBuffering: false,
                positionMillis: 0,
                durationMillis: 0,
                isLooping: false,
                didJustFinish: false,
            };
        }
        return {
            isLoaded: true,
            isPlaying: status.isPlaying,
            isBuffering: status.isBuffering,
            positionMillis: status.positionMillis,
            durationMillis: status.durationMillis || 0,
            rate: status.rate,
            isLooping: status.isLooping,
            didJustFinish: status.didJustFinish,
            error: status.error,
        };
    }
}
