/**
 * useSound Hook - Presentation Layer
 */

import { useSoundStore } from '../store';
import { SoundServiceFacade } from '../../application/SoundServiceFacade';

let facade: SoundServiceFacade | null = null;

const getFacade = (): SoundServiceFacade => {
    if (!facade) {
        facade = SoundServiceFacade.create(useSoundStore.getState());
    }
    return facade;
};

export const useSound = () => {
    const state = useSoundStore();

    const facade = getFacade();

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

        // Actions
        play: (id: string, source: any, options?: any) => facade.play(id, source, options),
        pause: () => facade.pause(),
        resume: () => facade.resume(),
        stop: () => facade.stop(),
        seek: (positionMillis: number) => facade.seek(positionMillis),
        setVolume: (volume: number) => facade.setVolume(volume),
        setRate: (rate: number) => facade.setRate(rate),
        preload: (id: string, source: any, options?: any) => facade.preload(id, source, options),
        unload: () => facade.unload(),
        clearCache: () => facade.clearCache(),
        isCached: (id: string) => facade.isCached(id),
    };
};
