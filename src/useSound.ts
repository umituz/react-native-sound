import { useCallback, useEffect } from 'react';
import { useSoundStore } from './store';
import { audioManager } from './AudioManager';
import { PlaybackOptions, SoundSource } from './types';

export const useSound = () => {
    const isPlaying = useSoundStore((state) => state.isPlaying);
    const isBuffering = useSoundStore((state) => state.isBuffering);
    const position = useSoundStore((state) => state.positionMillis);
    const duration = useSoundStore((state) => state.durationMillis);
    const currentId = useSoundStore((state) => state.currentId);
    const error = useSoundStore((state) => state.error);
    const volume = useSoundStore((state) => state.volume);

    useEffect(() => {
        return () => {
            if (__DEV__) console.log('[useSound] Cleanup on unmount');
        };
    }, []);

    const play = useCallback(
        async (id: string, source: SoundSource, options?: PlaybackOptions) => {
            if (currentId === id) {
                if (isPlaying) {
                    await audioManager.pause();
                } else {
                    await audioManager.resume();
                }
            } else {
                await audioManager.play(id, source, options);
            }
        },
        [currentId, isPlaying]
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
        position,
        duration,
        currentId,
        error,
        volume,
    };
};
