/**
 * useSound Hook - Event-Driven with Proper Lifecycle Management
 * Single hook for all sound functionality
 */

import { useEffect, useCallback, useRef } from 'react';
import { useSoundStore, setupEventListeners } from './SoundStore';
import { SoundService } from '../application/SoundService';
import type { SoundSourceValue } from '../domain/value-objects';
import type { PlaybackOptions } from '../types';
import { Logger } from '../infrastructure/Logger';

let serviceInstance: SoundService | null = null;
let serviceRefCount = 0;
let cleanupEventListeners: (() => void) | null = null;

const getService = (): SoundService => {
    if (!serviceInstance) {
        serviceInstance = SoundService.getInstance();
        // Access events through public API
        cleanupEventListeners = setupEventListeners(serviceInstance.getEvents());
    }
    serviceRefCount++;
    return serviceInstance;
};

const releaseService = async (): Promise<void> => {
    serviceRefCount--;
    if (serviceRefCount <= 0 && serviceInstance) {
        try {
            await serviceInstance.dispose();
        } catch (error) {
            Logger.warn('Error during service cleanup', error);
        }
        cleanupEventListeners?.();
        cleanupEventListeners = null;
        serviceInstance = null;
        serviceRefCount = 0;
    }
};

export const useSound = () => {
    const state = useSoundStore();
    const serviceRef = useRef<SoundService | null>(null);
    const isMountedRef = useRef(true);

    // Initialize service on mount
    useEffect(() => {
        serviceRef.current = getService();
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            // Don't await in cleanup - fire and forget
            releaseService().catch((error) => Logger.warn('Error in useSound cleanup', error));
        };
    }, []);

    // Memoize all functions to prevent re-renders
    const play = useCallback(
        (id: string, source: SoundSourceValue, options?: PlaybackOptions) => {
            if (isMountedRef.current && serviceRef.current) {
                return serviceRef.current.play(id, source, options);
            }
        },
        []
    );

    const pause = useCallback(() => {
        if (isMountedRef.current && serviceRef.current) {
            return serviceRef.current.pause();
        }
    }, []);

    const resume = useCallback(() => {
        if (isMountedRef.current && serviceRef.current) {
            return serviceRef.current.resume();
        }
    }, []);

    const stop = useCallback(() => {
        if (isMountedRef.current && serviceRef.current) {
            return serviceRef.current.stop();
        }
    }, []);

    const seek = useCallback(
        (positionMillis: number) => {
            if (isMountedRef.current && serviceRef.current) {
                return serviceRef.current.seek(positionMillis);
            }
        },
        []
    );

    const setVolume = useCallback(
        (volume: number) => {
            if (isMountedRef.current && serviceRef.current) {
                return serviceRef.current.setVolume(volume);
            }
        },
        []
    );

    const setRate = useCallback(
        (rate: number) => {
            if (isMountedRef.current && serviceRef.current) {
                return serviceRef.current.setRate(rate);
            }
        },
        []
    );

    const preload = useCallback(
        (id: string, source: SoundSourceValue, options?: PlaybackOptions) => {
            if (isMountedRef.current && serviceRef.current) {
                return serviceRef.current.preload(id, source, options);
            }
        },
        []
    );

    const unload = useCallback(() => {
        if (isMountedRef.current && serviceRef.current) {
            return serviceRef.current.unload();
        }
    }, []);

    const clearCache = useCallback(async () => {
        if (isMountedRef.current && serviceRef.current) {
            await serviceRef.current.clearCache();
        }
    }, []);

    const isCached = useCallback(
        (id: string) => {
            if (serviceRef.current) {
                return serviceRef.current.isCached(id);
            }
            return false;
        },
        []
    );

    const subscribe = useCallback(
        (eventType: string, listener: (payload: unknown) => void) => {
            if (serviceRef.current) {
                return serviceRef.current.on(eventType, listener);
            }
            return () => {};
        },
        []
    );

    return {
        // State
        isPlaying: state.isPlaying,
        isBuffering: state.isBuffering,
        isLooping: state.isLooping,
        position: state.positionMillis,
        duration: state.durationMillis,
        currentId: state.currentId,
        error: state.error,
        volume: state.volume,
        rate: state.rate,

        // Actions (memoized)
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

        // Advanced: Event subscription
        on: subscribe,
    };
};
