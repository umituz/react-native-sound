/**
 * Sound Cache Interface
 */

import { SoundSourceValue } from '../../domain/value-objects/SoundSource';

export interface CachedSound {
    sound: unknown;
    source: SoundSourceValue;
    loadedAt: number;
}

export interface ISoundCache {
    get(id: string): CachedSound | undefined;
    set(id: string, cached: CachedSound): void;
    delete(id: string): void;
    has(id: string): boolean;
    clear(): void;
    cleanExpired(): void;
    enforceLimit(): void;
}
