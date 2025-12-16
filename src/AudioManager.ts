import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { useSoundStore } from './store';
import { PlaybackOptions, SoundSource } from './types';

class AudioManager {
    private sound: Audio.Sound | null = null;
    private currentId: string | null = null;

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

        if (!status.isLoaded) {
            if (status.error) {
                store.setError(status.error);
                store.setPlaying(false);
            }
            return;
        }

        const s = status as AVPlaybackStatusSuccess;
        store.setPlaying(s.isPlaying);
        store.setBuffering(s.isBuffering);
        store.setProgress(s.positionMillis, s.durationMillis || 0);

        if (s.didJustFinish && !s.isLooping) {
            store.setPlaying(false);
            store.setProgress(s.durationMillis || 0, s.durationMillis || 0);
        }
    };

    async play(id: string, source: SoundSource, options?: PlaybackOptions) {
        const store = useSoundStore.getState();

        if (__DEV__) console.log('[AudioManager] Play called with ID:', id);

        // If same ID is playing/pausing
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
            // Unload previous sound
            await this.unload();

            this.currentId = id;
            store.setCurrent(id, source);
            store.setError(null);

            if (__DEV__) console.log('[AudioManager] Creating sound from source:', source);

            const { sound } = await Audio.Sound.createAsync(
                source as any,
                {
                    shouldPlay: true,
                    isLooping: options?.isLooping ?? false,
                    volume: options?.volume ?? 1.0,
                    rate: options?.rate ?? 1.0,
                    positionMillis: options?.positionMillis ?? 0,
                },
                this.onPlaybackStatusUpdate
            );

            this.sound = sound;
            if (__DEV__) console.log('[AudioManager] Sound created and playing');
        } catch (error: any) {
            if (__DEV__) console.error('[AudioManager] Error playing sound:', error);
            store.setError(error.message);
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

    async setVolume(volume: number) {
        if (this.sound) {
            await this.sound.setVolumeAsync(volume);
            useSoundStore.getState().setVolumeState(volume);
        }
    }

    async unload() {
        if (this.sound) {
            try {
                await this.sound.unloadAsync();
            } catch (e) {
                // Ignore unload errors
            }
            this.sound = null;
        }
        this.currentId = null;
        useSoundStore.getState().reset();
    }

    getCurrentId() {
        return this.currentId;
    }
}

export const audioManager = new AudioManager();
