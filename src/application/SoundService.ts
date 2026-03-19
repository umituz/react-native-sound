/**
 * Unified Sound Service - Combines Facade + Repository Pattern
 * Single entry point for all sound operations
 */

import type { SoundSourceValue } from '../domain/value-objects';
import type { PlaybackOptions } from '../types';
import { AudioConfig } from '../infrastructure/AudioConfig';
import { AudioRepository } from '../infrastructure/AudioRepository';
import { SoundCommandProcessor, type SoundCommand, type PlayCommand, type PreloadCommand } from './SoundCommands';
import { SoundEvents } from './SoundEvents';
import { Logger } from '../infrastructure/Logger';

export class SoundService {
    private static instance: SoundService | null = null;
    private repository: AudioRepository;
    private commandProcessor: SoundCommandProcessor;
    private events: SoundEvents;

    private constructor() {
        this.events = new SoundEvents();
        this.repository = new AudioRepository(this.events);
        this.commandProcessor = new SoundCommandProcessor(
            this.repository.audioService,
            this.repository.cache,
            this.events
        );

        // Initialize audio config
        AudioConfig.configure().catch((error) => Logger.warn('Failed to configure audio', error));
    }

    static getInstance(): SoundService {
        if (!this.instance) {
            this.instance = new SoundService();
        }
        return this.instance;
    }

    // ===== Public API =====

    /**
     * Play a sound
     */
    async play(id: string, source: SoundSourceValue, options?: PlaybackOptions): Promise<void> {
        const command: SoundCommand = {
            type: 'PLAY',
            payload: {
                id,
                source,
                volume: options?.volume,
                rate: options?.rate,
                isLooping: options?.isLooping,
                positionMillis: options?.positionMillis,
            },
        };
        await this.commandProcessor.execute(command);
    }

    /**
     * Pause playback
     */
    async pause(): Promise<void> {
        const sound = this.commandProcessor.getCurrentSound();
        await this.commandProcessor.execute({ type: 'PAUSE', payload: { sound } });
    }

    /**
     * Resume playback
     */
    async resume(): Promise<void> {
        const sound = this.commandProcessor.getCurrentSound();
        await this.commandProcessor.execute({ type: 'RESUME', payload: { sound } });
    }

    /**
     * Stop playback
     */
    async stop(): Promise<void> {
        const sound = this.commandProcessor.getCurrentSound();
        await this.commandProcessor.execute({ type: 'STOP', payload: { sound } });
    }

    /**
     * Seek to position
     */
    async seek(positionMillis: number): Promise<void> {
        const sound = this.commandProcessor.getCurrentSound();
        await this.commandProcessor.execute({
            type: 'SEEK',
            payload: { sound, positionMillis },
        });
    }

    /**
     * Set volume
     */
    async setVolume(volume: number): Promise<void> {
        const sound = this.commandProcessor.getCurrentSound();
        await this.commandProcessor.execute({
            type: 'SET_VOLUME',
            payload: { sound, volume },
        });
    }

    /**
     * Set rate
     */
    async setRate(rate: number): Promise<void> {
        const sound = this.commandProcessor.getCurrentSound();
        await this.commandProcessor.execute({
            type: 'SET_RATE',
            payload: { sound, rate },
        });
    }

    /**
     * Preload a sound
     */
    async preload(id: string, source: SoundSourceValue, options?: PlaybackOptions): Promise<void> {
        const command: SoundCommand = {
            type: 'PRELOAD',
            payload: {
                id,
                source,
                volume: options?.volume,
                rate: options?.rate,
                isLooping: options?.isLooping,
            },
        };
        await this.commandProcessor.execute(command);
    }

    /**
     * Unload current sound
     */
    async unload(): Promise<void> {
        await this.commandProcessor.execute({ type: 'UNLOAD', payload: undefined });
    }

    /**
     * Clear cache
     */
    async clearCache(): Promise<void> {
        await this.commandProcessor.execute({ type: 'CLEAR_CACHE', payload: undefined });
    }

    /**
     * Check if sound is cached
     */
    isCached(id: string): boolean {
        return this.repository.cache.has(id);
    }

    /**
     * Get current playing id
     */
    getCurrentId(): string | null {
        return this.commandProcessor.getCurrentId();
    }

    /**
     * Subscribe to events
     */
    on(eventType: string, listener: (payload: unknown) => void): () => void {
        return this.events.on(eventType, listener);
    }

    /**
     * Cleanup resources
     */
    async dispose(): Promise<void> {
        await this.unload();
        await this.clearCache();
        this.events.clear();
    }

    /**
     * Get events instance (for internal use by useSound hook)
     * @internal
     */
    getEvents(): SoundEvents {
        return this.events;
    }
}
