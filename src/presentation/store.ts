/**
 * Sound Store - State Management
 */

import { createStore } from '@umituz/react-native-design-system/storage';

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
}

interface SoundActions {
    setPlaying: (isPlaying: boolean) => void;
    setBuffering: (isBuffering: boolean) => void;
    setProgress: (position: number, duration: number) => void;
    setError: (error: string | null) => void;
    setCurrent: (id: string | null, source: any) => void;
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
};

export const useSoundStore = createStore<SoundState, SoundActions>({
    name: 'sound-store',
    initialState,
    persist: false,
    actions: (set) => ({
        setPlaying: (isPlaying) => set({ isPlaying }),
        setBuffering: (isBuffering) => set({ isBuffering }),
        setProgress: (position, duration) => set({ positionMillis: position, durationMillis: duration }),
        setError: (error) => set({ error }),
        setCurrent: (currentId) => set({ currentId }),
        setVolumeState: (volume) => set({ volume }),
        setRateState: (rate) => set({ rate }),
        setLooping: (isLooping) => set({ isLooping }),
        reset: () => set(initialState),
    }),
});
