/**
 * Sound Cache Implementation
 */

import { ISoundCache, CachedSound } from '../application/interfaces/ISoundCache';
import { IAudioService } from '../application/interfaces/IAudioService';
import { Logger } from './Logger';

export class SoundCache implements ISoundCache {
    private cache = new Map<string, CachedSound>();
    private readonly maxCacheSize = 3;
    private readonly cacheExpireMs = 5 * 60 * 1000;

    constructor(private readonly audioService: IAudioService) {}

    get(id: string): CachedSound | undefined {
        return this.cache.get(id);
    }

    set(id: string, cached: CachedSound): void {
        this.cleanExpired();
        this.enforceLimit();
        this.cache.set(id, cached);
        Logger.debug(`Cached: ${id}`);
    }

    delete(id: string): void {
        const cached = this.cache.get(id);
        if (cached) {
            this.audioService.unload(cached.sound).catch((error) => {
                Logger.warn(`Failed to unload cache: ${id}`, error);
            });
        }
        this.cache.delete(id);
    }

    has(id: string): boolean {
        return this.cache.has(id);
    }

    clear(): void {
        for (const cached of this.cache.values()) {
            this.audioService.unload(cached.sound).catch((error) => {
                Logger.warn('Failed to unload during cache clear', error);
            });
        }
        this.cache.clear();
        Logger.debug('Cache cleared');
    }

    cleanExpired(): void {
        const now = Date.now();
        for (const [id, cached] of this.cache) {
            if (now - cached.loadedAt > this.cacheExpireMs) {
                this.delete(id);
                Logger.debug(`Expired cache removed: ${id}`);
            }
        }
    }

    enforceLimit(): void {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.delete(firstKey);
                Logger.debug(`Cache limit enforced, removed: ${firstKey}`);
            }
        }
    }
}
