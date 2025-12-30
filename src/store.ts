import { createStore } from '@umituz/react-native-storage';
import type { SoundState, SoundSource } from './types';

interface SoundActions {
    setPlaying: (isPlaying: boolean) => void;
    setBuffering: (isBuffering: boolean) => void;
    setProgress: (position: number, duration: number) => void;
    setError: (error: string | null) => void;
    setCurrent: (id: string | null, source: SoundSource | null) => void;
    setVolumeState: (volume: number) => void;
    reset: () => void;
}

const initialSoundState: SoundState = {
    isPlaying: false,
    isBuffering: false,
    positionMillis: 0,
    durationMillis: 0,
    volume: 1.0,
    rate: 1.0,
    error: null,
    currentSource: null,
    currentId: null,
};

export const useSoundStore = createStore<SoundState, SoundActions>({
    name: 'sound-store',
    initialState: initialSoundState,
    persist: false,
    actions: (set) => ({
        setPlaying: (isPlaying) => set({ isPlaying }),
        setBuffering: (isBuffering) => set({ isBuffering }),
        setProgress: (position, duration) =>
            set({ positionMillis: position, durationMillis: duration }),
        setError: (error) => set({ error }),
        setCurrent: (id, source) => set({ currentId: id, currentSource: source }),
        setVolumeState: (volume) => set({ volume }),
        reset: () => set(initialSoundState),
    }),
});
