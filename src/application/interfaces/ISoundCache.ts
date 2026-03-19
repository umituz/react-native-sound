/**
 * Sound Cache Interface
 */

import type { SoundSourceValue } from '../../domain/value-objects';

export interface CachedSound {
    sound: unknown;
    source: SoundSourceValue;
    loadedAt: number;
}

export interface ISoundCache {
    get(id: string): CachedSound | undefined;
    set(id: string, cached: CachedSound): Promise<void>;
    delete(id: string): Promise<void>;
    has(id: string): boolean;
    clear(): Promise<void>;
}
