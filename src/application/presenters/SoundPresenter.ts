/**
 * Sound Presenter - Manages Store Updates
 */

import { PlaybackStatus } from '../interfaces/IAudioService';
import { SoundSourceValue } from '../../domain/value-objects/SoundSource';
import { Logger } from '../../infrastructure/Logger';

export interface SoundStore {
    setPlaying: (isPlaying: boolean) => void;
    setBuffering: (isBuffering: boolean) => void;
    setProgress: (position: number, duration: number) => void;
    setError: (error: string | null) => void;
    setCurrent: (id: string | null, source: SoundSourceValue | null) => void;
    setVolumeState: (volume: number) => void;
    setRateState: (rate: number) => void;
    setLooping: (isLooping: boolean) => void;
    reset: () => void;
}

export class SoundPresenter {
    constructor(private readonly store: SoundStore) {}

    onPlaybackUpdate(status: PlaybackStatus): void {
        if (!status.isLoaded && status.error) {
            this.store.setError(status.error);
            this.store.setPlaying(false);
            return;
        }

        if (status.isLoaded) {
            this.store.setPlaying(status.isPlaying);
            this.store.setBuffering(status.isBuffering);
            this.store.setProgress(status.positionMillis, status.durationMillis);

            if (status.rate !== undefined) {
                this.store.setRateState(status.rate);
            }

            if (status.didJustFinish && !status.isLooping) {
                this.store.setPlaying(false);
                this.store.setProgress(status.durationMillis, status.durationMillis);
            }
        }
    }

    onPlaybackStart(id: string, source: SoundSourceValue, options: { volume: number; rate: number; isLooping: boolean }): void {
        this.store.setCurrent(id, source);
        this.store.setError(null);
        this.store.setVolumeState(options.volume);
        this.store.setRateState(options.rate);
        this.store.setLooping(options.isLooping);
        Logger.debug(`Playback started: ${id}`);
    }

    onPlaybackError(error: string): void {
        this.store.setError(error);
        Logger.error('Playback error', error);
    }

    onPlaybackStop(): void {
        this.store.setPlaying(false);
        Logger.debug('Playback stopped');
    }

    onVolumeChange(volume: number): void {
        this.store.setVolumeState(volume);
    }

    onRateChange(rate: number): void {
        this.store.setRateState(rate);
    }

    onReset(): void {
        this.store.reset();
        Logger.debug('State reset');
    }
}
