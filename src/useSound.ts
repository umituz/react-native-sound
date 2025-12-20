import { useCallback } from 'react';
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

    const play = useCallback(
        async (id: string, source: SoundSource, options?: PlaybackOptions) => {
            // Toggle logic: If same ID, toggle pause/resume
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

    const stop = useCallback(async () => {
        await audioManager.stop();
    }, []);

    const setVolume = useCallback(async (vol: number) => {
        await audioManager.setVolume(vol);
    }, []);

    const unload = useCallback(async () => {
        await audioManager.unload();
    }, []);

    return {
        play,
        pause,
        stop,
        unload,
        setVolume,
        isPlaying,
        isBuffering,
        position,
        duration,
        currentId,
        error,
        volume,
    };
};
