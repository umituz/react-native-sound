/**
 * Event-Driven Sound Store - Eliminates Presenter Pattern
 * Direct event subscription from SoundService
 */

import { createStore } from '@umituz/react-native-design-system/storage';
import type { PlaybackStatus } from '../application/interfaces/IAudioService';
import type { SoundSourceValue } from '../domain/value-objects';
import type { SoundEvents } from '../application/SoundEvents';

// ===== Store State =====
interface SoundState {
    isPlaying: boolean;
    isBuffering: boolean;
    positionMillis: number;
    durationMillis: number;
    volume: number;
    rate: number;
    isLooping: boolean;
    error: string | null;
    currentId: string | null;
    currentSource: SoundSourceValue | null;
}

interface SoundActions {
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

const initialState: SoundState = {
    isPlaying: false,
    isBuffering: false,
    positionMillis: 0,
    durationMillis: 0,
    volume: 1.0,
    rate: 1.0,
    isLooping: false,
    error: null,
    currentId: null,
    currentSource: null,
};

// ===== Store Creation =====
export const useSoundStore = createStore<SoundState, SoundActions>({
    name: 'sound-store',
    initialState,
    persist: false,
    actions: (set) => ({
        setPlaying: (isPlaying) => set({ isPlaying }),
        setBuffering: (isBuffering) => set({ isBuffering }),
        setProgress: (position, duration) => set({ positionMillis: position, durationMillis: duration }),
        setError: (error) => set({ error }),
        setCurrent: (currentId, currentSource) => set({ currentId, currentSource }),
        setVolumeState: (volume) => set({ volume }),
        setRateState: (rate) => set({ rate }),
        setLooping: (isLooping) => set({ isLooping }),
        reset: () => set(initialState),
    }),
});

// ===== Event Integration =====
export function setupEventListeners(events: SoundEvents): () => void {
    const unsubscribers: Array<() => void> = [];

    // Playback started
    unsubscribers.push(
        events.on('PLAYBACK_STARTED', (payload) => {
            const p = payload as { id: string; source: SoundSourceValue; volume: number; rate: number; isLooping: boolean };
            const store = useSoundStore.getState();
            store.setCurrent(p.id, p.source);
            store.setError(null);
            store.setVolumeState(p.volume);
            store.setRateState(p.rate);
            store.setLooping(p.isLooping);
            store.setPlaying(true);
        })
    );

    // Playback stopped
    unsubscribers.push(
        events.on('PLAYBACK_STOPPED', () => {
            const store = useSoundStore.getState();
            store.setPlaying(false);
        })
    );

    // Status update
    unsubscribers.push(
        events.on('STATUS_UPDATE', (payload) => {
            const status = payload as PlaybackStatus;
            const store = useSoundStore.getState();
            if (status.isLoaded) {
                store.setPlaying(status.isPlaying);
                store.setBuffering(status.isBuffering);
                store.setProgress(status.positionMillis, status.durationMillis);

                if (status.rate !== undefined) {
                    store.setRateState(status.rate);
                }

                if (status.didJustFinish && !status.isLooping) {
                    store.setPlaying(false);
                    store.setProgress(status.durationMillis, status.durationMillis);
                }
            }

            if (status.error) {
                store.setError(status.error);
                store.setPlaying(false);
            }
        })
    );

    // Volume changed
    unsubscribers.push(
        events.on('VOLUME_CHANGED', (payload) => {
            useSoundStore.getState().setVolumeState(payload as number);
        })
    );

    // Rate changed
    unsubscribers.push(
        events.on('RATE_CHANGED', (payload) => {
            useSoundStore.getState().setRateState(payload as number);
        })
    );

    // State reset
    unsubscribers.push(
        events.on('STATE_RESET', () => {
            useSoundStore.getState().reset();
        })
    );

    // Error
    unsubscribers.push(
        events.on('ERROR', (payload) => {
            const error = payload as string;
            const store = useSoundStore.getState();
            store.setError(error);
            store.setPlaying(false);
        })
    );

    // Return cleanup function
    return () => {
        unsubscribers.forEach((unsub) => unsub());
    };
}
