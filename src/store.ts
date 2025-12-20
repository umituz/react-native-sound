import { create } from 'zustand';
import { SoundState } from './types';

interface SoundStore extends SoundState {
    setPlaying: (isPlaying: boolean) => void;
    setBuffering: (isBuffering: boolean) => void;
    setProgress: (position: number, duration: number) => void;
    setError: (error: string | null) => void;
    setCurrent: (id: string | null, source: any) => void;
    setVolumeState: (volume: number) => void;
    reset: () => void;
}

export const useSoundStore = create<SoundStore>((set) => ({
    isPlaying: false,
    isBuffering: false,
    positionMillis: 0,
    durationMillis: 0,
    volume: 1.0,
    rate: 1.0,
    error: null,
    currentSource: null,
    currentId: null,

    setPlaying: (isPlaying) => set({ isPlaying }),
    setBuffering: (isBuffering) => set({ isBuffering }),
    setProgress: (position, duration) =>
        set({ positionMillis: position, durationMillis: duration }),
    setError: (error) => set({ error }),
    setCurrent: (id, source) => set({ currentId: id, currentSource: source }),
    setVolumeState: (volume) => set({ volume }),
    reset: () =>
        set({
            isPlaying: false,
            isBuffering: false,
            positionMillis: 0,
            durationMillis: 0,
            error: null,
            currentSource: null,
            currentId: null,
        }),
}));
