import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { useSoundStore } from './store';
import {
    PlaybackOptions,
    SoundSource,
    isPlaybackStatusSuccess,
    isSoundSourceValid,
    clampVolume,
    clampRate,
} from './types';

interface CachedSound {
    sound: Audio.Sound;
    source: SoundSource;
    loadedAt: number;
}

class AudioManager {
    private sound: Audio.Sound | null = null;
    private currentId: string | null = null;
    private cache: Map<string, CachedSound> = new Map();
    private readonly maxCacheSize = 3;
    private readonly cacheExpireMs = 5 * 60 * 1000;

    constructor() {
        this.configureAudio();
    }

    private async configureAudio() {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            });
        } catch (error) {
            if (__DEV__) console.warn('Failed to configure audio session', error);
        }
    }

    private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        const store = useSoundStore.getState();

        if (!isPlaybackStatusSuccess(status)) {
            if (status.error) {
                store.setError(status.error);
                store.setPlaying(false);
            }
            return;
        }

        store.setPlaying(status.isPlaying);
        store.setBuffering(status.isBuffering);
        store.setProgress(status.positionMillis, status.durationMillis || 0);

        if (status.didJustFinish && !status.isLooping) {
            store.setPlaying(false);
            store.setProgress(status.durationMillis || 0, status.durationMillis || 0);
        }
    };

    private cleanExpiredCache() {
        const now = Date.now();
        for (const [id, cached] of this.cache) {
            if (now - cached.loadedAt > this.cacheExpireMs) {
                cached.sound.unloadAsync().catch(() => {});
                this.cache.delete(id);
                if (__DEV__) console.log('[AudioManager] Expired cache removed:', id);
            }
        }
    }

    private enforceCacheLimit() {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                const cached = this.cache.get(firstKey);
                cached?.sound.unloadAsync().catch(() => {});
                this.cache.delete(firstKey);
                if (__DEV__) console.log('[AudioManager] Cache limit enforced, removed:', firstKey);
            }
        }
    }

    async preload(id: string, source: SoundSource, options?: PlaybackOptions) {
        if (!isSoundSourceValid(source)) {
            throw new Error('Invalid sound source: source is null or undefined');
        }

        if (this.cache.has(id)) {
            if (__DEV__) console.log('[AudioManager] Already cached:', id);
            return;
        }

        try {
            this.cleanExpiredCache();
            this.enforceCacheLimit();

            const volume = options?.volume !== undefined ? clampVolume(options.volume) : 1.0;
            const rate = options?.rate !== undefined ? clampRate(options.rate) : 1.0;

            const { sound } = await Audio.Sound.createAsync(
                source,
                {
                    shouldPlay: false,
                    isLooping: options?.isLooping ?? false,
                    volume,
                    rate,
                },
                this.onPlaybackStatusUpdate
            );

            this.cache.set(id, { sound, source, loadedAt: Date.now() });
            if (__DEV__) console.log('[AudioManager] Preloaded:', id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            if (__DEV__) console.error('[AudioManager] Error preloading sound:', error);
            throw new Error(errorMessage);
        }
    }

    async play(id: string, source: SoundSource, options?: PlaybackOptions) {
        const store = useSoundStore.getState();

        if (__DEV__) console.log('[AudioManager] Play called with ID:', id);

        if (!isSoundSourceValid(source)) {
            const errorMsg = 'Invalid sound source: source is null or undefined';
            store.setError(errorMsg);
            throw new Error(errorMsg);
        }

        if (this.currentId === id && this.sound) {
            const status = await this.sound.getStatusAsync();
            if (status.isLoaded) {
                if (status.isPlaying) {
                    return;
                } else {
                    if (__DEV__) console.log('[AudioManager] Resuming existing sound');
                    await this.sound.playAsync();
                    return;
                }
            }
        }

        try {
            await this.unload();

            const volume = options?.volume !== undefined ? clampVolume(options.volume) : 1.0;
            const rate = options?.rate !== undefined ? clampRate(options.rate) : 1.0;

            const cached = this.cache.get(id);
            if (cached) {
                this.sound = cached.sound;
                this.cache.delete(id);
                if (__DEV__) console.log('[AudioManager] Using cached sound:', id);
            } else {
                const { sound } = await Audio.Sound.createAsync(
                    source,
                    {
                        shouldPlay: true,
                        isLooping: options?.isLooping ?? false,
                        volume,
                        rate,
                        positionMillis: options?.positionMillis ?? 0,
                    },
                    this.onPlaybackStatusUpdate
                );
                this.sound = sound;
                if (__DEV__) console.log('[AudioManager] Sound created and playing');
            }

            this.currentId = id;
            store.setCurrent(id, source);
            store.setError(null);

            if (!cached) {
                await this.sound?.playAsync();
            } else {
                await this.sound?.setVolumeAsync(volume);
                await this.sound?.setRateAsync(rate, false);
                await this.sound?.playAsync();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            if (__DEV__) console.error('[AudioManager] Error playing sound:', error);
            store.setError(errorMessage);
            this.currentId = null;
            throw error;
        }
    }

    async pause() {
        if (this.sound) {
            await this.sound.pauseAsync();
        }
    }

    async resume() {
        if (this.sound) {
            await this.sound.playAsync();
        }
    }

    async stop() {
        if (this.sound) {
            await this.sound.stopAsync();
            useSoundStore.getState().setPlaying(false);
            useSoundStore.getState().setProgress(0, 0);
        }
    }

    async seek(positionMillis: number) {
        if (this.sound) {
            const status = await this.sound.getStatusAsync();
            if (status.isLoaded) {
                await this.sound.setStatusAsync({ positionMillis: Math.max(0, positionMillis) });
            }
        }
    }

    async setVolume(volume: number) {
        if (this.sound) {
            const clampedVolume = clampVolume(volume);
            await this.sound.setVolumeAsync(clampedVolume);
            useSoundStore.getState().setVolumeState(clampedVolume);
        }
    }

    async setRate(rate: number) {
        if (this.sound) {
            const clampedRate = clampRate(rate);
            const status = await this.sound.getStatusAsync();
            if (status.isLoaded) {
                try {
                    await this.sound.setRateAsync(clampedRate, false);
                } catch (error) {
                    if (__DEV__) console.warn('[AudioManager] Could not set rate:', error);
                }
            }
        }
    }

    async unload() {
        if (this.sound) {
            try {
                await this.sound.unloadAsync();
            } catch (e) {
                if (__DEV__) console.warn('[AudioManager] Error unloading sound:', e);
            }
            this.sound = null;
        }
        this.currentId = null;
        useSoundStore.getState().reset();
    }

    clearCache() {
        for (const cached of this.cache.values()) {
            cached.sound.unloadAsync().catch(() => {});
        }
        this.cache.clear();
        if (__DEV__) console.log('[AudioManager] Cache cleared');
    }

    getCurrentId() {
        return this.currentId;
    }

    isCached(id: string): boolean {
        return this.cache.has(id);
    }
}

export const audioManager = new AudioManager();
