/**
 * Utility Functions - Backward Compatibility + Performance Utilities
 */

import { Volume } from './domain/value-objects';
import { Rate } from './domain/value-objects';
import type { PlaybackStatus } from './application/interfaces/IAudioService';
import { Logger } from './infrastructure/Logger';

// ===== Backward Compatibility Functions =====

export function clampVolume(volume: number): number {
    return new Volume(volume).getValue();
}

export function clampRate(rate: number): number {
    return new Rate(rate).getValue();
}

export function validateSoundId(id: string): boolean {
    return typeof id === 'string' && id.trim().length > 0;
}

export function isSoundSourceValid(source: unknown): boolean {
    return source !== null && source !== undefined;
}

export function isPlaybackStatusSuccess(status: PlaybackStatus): boolean {
    return status.isLoaded === true;
}

// ===== Performance Utilities =====

/**
 * Debounce function to limit execution frequency
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (this: unknown, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args);
            timeoutId = null;
        }, wait);
    };
}

/**
 * Throttle function to limit execution frequency
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;
    let lastArgs: Parameters<T> | null = null;
    let lastContext: unknown = null;

    return function (this: unknown, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    func.apply(lastContext, lastArgs);
                    lastArgs = null;
                    lastContext = null;
                }
            }, limit);
        } else {
            lastArgs = args;
            lastContext = this;
        }
    };
}

/**
 * Memory-safe rate limiter for periodic operations
 */
export class RateLimiter {
    private lastExecution = 0;
    private pendingExecution: (() => void) | null = null;

    constructor(private readonly minInterval: number) {}

    async execute(fn: () => void | Promise<void>): Promise<void> {
        const now = Date.now();
        const timeSinceLastExecution = now - this.lastExecution;

        if (timeSinceLastExecution >= this.minInterval) {
            this.lastExecution = now;
            await fn();
        } else {
            // Schedule for later if not already pending
            if (!this.pendingExecution) {
                this.pendingExecution = fn;
                const delay = this.minInterval - timeSinceLastExecution;
                setTimeout(async () => {
                    if (this.pendingExecution) {
                        await this.pendingExecution();
                        this.pendingExecution = null;
                    }
                    this.lastExecution = Date.now();
                }, delay);
            }
        }
    }

    clearPending(): void {
        this.pendingExecution = null;
    }
}

/**
 * Memory-safe periodic task scheduler
 */
export class PeriodicTask {
    private timerId: ReturnType<typeof setInterval> | null = null;
    private isRunning = false;

    constructor(
        private readonly task: () => void | Promise<void>,
        private readonly interval: number
    ) {}

    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.timerId = setInterval(async () => {
            try {
                await this.task();
            } catch (error) {
                Logger.error('Periodic task error', error);
            }
        }, this.interval);
    }

    stop(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
    }

    isActive(): boolean {
        return this.isRunning;
    }
}

/**
 * WeakMap-based cache for automatic garbage collection
 */
export class AutoGCWeakCache<K extends object, V> {
    private cache = new WeakMap<K, V>();

    set(key: K, value: V): void {
        this.cache.set(key, value);
    }

    get(key: K): V | undefined {
        return this.cache.get(key);
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }

    delete(key: K): boolean {
        return this.cache.delete(key);
    }
}

