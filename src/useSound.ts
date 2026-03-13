import { useCallback } from 'react';
import { useSoundStore } from './store';
import { audioManager } from './AudioManager';
import { PlaybackOptions, SoundSource } from './types';

export const useSound = (): {
    play: (id: string, source: SoundSource, options?: PlaybackOptions) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    stop: () => Promise<void>;
    seek: (positionMillis: number) => Promise<void>;
    setVolume: (vol: number) => Promise<void>;
    setRate: (rate: number) => Promise<void>;
    preload: (id: string, source: SoundSource, options?: PlaybackOptions) => Promise<void>;
    unload: () => Promise<void>;
    clearCache: () => void;
    isCached: (id: string) => boolean;
    isPlaying: boolean;
    isBuffering: boolean;
    isLooping: boolean;
    position: number;
    duration: number;
    currentId: string | null;
    error: string | null;
    volume: number;
    rate: number;
} => {
    const isPlaying = useSoundStore((state) => state.isPlaying);
    const isBuffering = useSoundStore((state) => state.isBuffering);
    const isLooping = useSoundStore((state) => state.isLooping);
    const position = useSoundStore((state) => state.positionMillis);
    const duration = useSoundStore((state) => state.durationMillis);
    const currentId = useSoundStore((state) => state.currentId);
    const error = useSoundStore((state) => state.error);
    const volume = useSoundStore((state) => state.volume);
    const rate = useSoundStore((state) => state.rate);

    const play = useCallback(
        async (id: string, source: SoundSource, options?: PlaybackOptions) => {
            await audioManager.play(id, source, options);
        },
        []
    );

    const pause = useCallback(async () => {
        await audioManager.pause();
    }, []);

    const resume = useCallback(async () => {
        await audioManager.resume();
    }, []);

    const stop = useCallback(async () => {
        await audioManager.stop();
    }, []);

    const seek = useCallback(async (positionMillis: number) => {
        await audioManager.seek(positionMillis);
    }, []);

    const setVolume = useCallback(async (vol: number) => {
        await audioManager.setVolume(vol);
    }, []);

    const setRate = useCallback(async (rate: number) => {
        await audioManager.setRate(rate);
    }, []);

    const preload = useCallback(async (id: string, source: SoundSource, options?: PlaybackOptions) => {
        await audioManager.preload(id, source, options);
    }, []);

    const unload = useCallback(async () => {
        await audioManager.unload();
    }, []);

    const clearCache = useCallback(() => {
        audioManager.clearCache();
    }, []);

    const isCached = useCallback((id: string): boolean => {
        return audioManager.isCached(id);
    }, []);

    return {
        play,
        pause,
        resume,
        stop,
        seek,
        setVolume,
        setRate,
        preload,
        unload,
        clearCache,
        isCached,
        isPlaying,
        isBuffering,
        isLooping,
        position,
        duration,
        currentId,
        error,
        volume,
        rate,
    };
};
