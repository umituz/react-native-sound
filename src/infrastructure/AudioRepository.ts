/**
 * Audio Repository - Combines Cache + Audio Service
 * Single responsibility: Audio resource management
 */

import { Audio } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import type { IAudioService, PlaybackStatus, PlaybackOptions } from '../application/interfaces/IAudioService';
import type { ISoundCache, CachedSound } from '../application/interfaces/ISoundCache';
import type { SoundSourceValue } from '../domain/value-objects';
import { SoundEvents } from '../application/SoundEvents';
import { Logger } from './Logger';
import { RateLimiter } from '../utils';

// ===== Audio Service Implementation =====
class ExpoAudioService implements IAudioService {
    async createSound(
        source: SoundSourceValue,
        options: PlaybackOptions,
        onStatusUpdate: (status: PlaybackStatus) => void
    ): Promise<{ sound: Audio.Sound }> {
        const { sound } = await Audio.Sound.createAsync(
            source,
            {
                shouldPlay: options.shouldPlay,
                isLooping: options.isLooping,
                volume: options.volume,
                rate: options.rate,
                positionMillis: options.positionMillis,
            },
            (status) => onStatusUpdate(this.mapStatus(status))
        );
        Logger.debug('Sound created');
        return { sound };
    }

    async play(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).playAsync();
    }

    async pause(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).pauseAsync();
    }

    async stop(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).stopAsync();
    }

    async unload(sound: unknown): Promise<void> {
        await (sound as Audio.Sound).unloadAsync();
    }

    async setVolume(sound: unknown, volume: number): Promise<void> {
        await (sound as Audio.Sound).setVolumeAsync(volume);
    }

    async setRate(sound: unknown, rate: number): Promise<void> {
        await (sound as Audio.Sound).setRateAsync(rate, false);
    }

    async setPosition(sound: unknown, positionMillis: number): Promise<void> {
        await (sound as Audio.Sound).setStatusAsync({ positionMillis });
    }

    async getStatus(sound: unknown): Promise<PlaybackStatus | null> {
        const status = await (sound as Audio.Sound).getStatusAsync();
        return status.isLoaded ? this.mapStatus(status) : null;
    }

    private mapStatus(status: AVPlaybackStatus): PlaybackStatus {
        if (!status.isLoaded) {
            const statusRecord = status as Record<string, unknown>;
            const hasError = 'error' in statusRecord;
            const error = hasError && statusRecord.error instanceof Error ? statusRecord.error.message : undefined;
            return {
                isLoaded: false,
                isPlaying: false,
                isBuffering: false,
                positionMillis: 0,
                durationMillis: 0,
                isLooping: false,
                didJustFinish: false,
                error,
            };
        }
        return {
            isLoaded: true,
            isPlaying: status.isPlaying,
            isBuffering: status.isBuffering,
            positionMillis: status.positionMillis,
            durationMillis: status.durationMillis || 0,
            rate: status.rate,
            isLooping: status.isLooping,
            didJustFinish: status.didJustFinish,
        };
    }
}

// ===== Sound Cache Configuration =====
const CACHE_CONFIG = {
    MAX_SIZE: 3,
    EXPIRE_MS: 5 * 60 * 1000, // 5 minutes
    CLEAN_INTERVAL_MS: 30 * 1000, // 30 seconds
} as const;

// ===== Sound Cache Implementation =====
class SoundCache implements ISoundCache {
    private cache = new Map<string, CachedSound>();
    private accessOrder: string[] = [];
    private readonly maxSize = CACHE_CONFIG.MAX_SIZE;
    private readonly expireMs = CACHE_CONFIG.EXPIRE_MS;
    private lastCleanTime = 0;
    private readonly cleanIntervalMs = CACHE_CONFIG.CLEAN_INTERVAL_MS;
    private cleanLimiter = new RateLimiter(this.cleanIntervalMs);

    constructor(
        private readonly audioService: IAudioService,
        private readonly events: SoundEvents
    ) {}

    get(id: string): CachedSound | undefined {
        const cached = this.cache.get(id);
        if (cached) {
            this.updateAccessOrder(id);
        }
        return cached;
    }

    async set(id: string, cached: CachedSound): Promise<void> {
        await this.cleanExpiredThrottled();
        await this.enforceLimit();
        this.cache.set(id, cached);
        this.updateAccessOrder(id);
        Logger.debug(`Cached: ${id}`);
    }

    async delete(id: string): Promise<void> {
        const cached = this.cache.get(id);
        if (cached) {
            try {
                await this.audioService.unload(cached.sound);
            } catch (error) {
                Logger.warn(`Failed to unload: ${id}`, error);
            }
        }
        this.cache.delete(id);
        this.removeFromAccessOrder(id);
    }

    has(id: string): boolean {
        return this.cache.has(id);
    }

    async clear(): Promise<void> {
        const unloadPromises = Array.from(this.cache.values()).map((cached) =>
            this.audioService.unload(cached.sound).catch((error) => {
                Logger.warn('Failed to unload during clear', error);
            })
        );
        await Promise.all(unloadPromises);
        this.cache.clear();
        this.accessOrder = [];
        Logger.debug('Cache cleared');
    }

    private async cleanExpiredThrottled(): Promise<void> {
        await this.cleanLimiter.execute(async () => {
            const now = Date.now();
            const expiredIds: string[] = [];
            for (const [id, cached] of this.cache) {
                if (now - cached.loadedAt > this.expireMs) {
                    expiredIds.push(id);
                }
            }
            for (const id of expiredIds) {
                await this.delete(id);
                Logger.debug(`Expired cache removed: ${id}`);
            }
        });
    }

    private async enforceLimit(): Promise<void> {
        while (this.cache.size >= this.maxSize && this.accessOrder.length > 0) {
            const lruId = this.accessOrder[0];
            if (lruId && this.cache.has(lruId)) {
                await this.delete(lruId);
                Logger.debug(`LRU enforced, removed: ${lruId}`);
            } else {
                break;
            }
        }
    }

    private updateAccessOrder(id: string): void {
        this.removeFromAccessOrder(id);
        this.accessOrder.push(id);
    }

    private removeFromAccessOrder(id: string): void {
        const index = this.accessOrder.indexOf(id);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
    }
}

// ===== Repository Export =====
export class AudioRepository {
    readonly audioService: IAudioService;
    readonly cache: ISoundCache;

    constructor(events: SoundEvents) {
        this.audioService = new ExpoAudioService();
        this.cache = new SoundCache(this.audioService, events);
    }
}
