/**
 * Generic Command Processor - Eliminates Use Case Duplication
 * Replaces 8 separate use case files with single command pattern
 */

import type { SoundSourceValue } from '../domain/value-objects';
import type { IAudioService, PlaybackStatus } from './interfaces/IAudioService';
import type { ISoundCache } from './interfaces/ISoundCache';
import { SoundEvents } from './SoundEvents';
import { SoundError } from '../domain/errors/SoundError';
import { Logger } from '../infrastructure/Logger';

// ===== Command Definitions =====
export type SoundCommand =
    | { type: 'PLAY'; payload: PlayCommand }
    | { type: 'PAUSE'; payload: { sound: unknown } }
    | { type: 'RESUME'; payload: { sound: unknown } }
    | { type: 'STOP'; payload: { sound: unknown } }
    | { type: 'SEEK'; payload: { sound: unknown; positionMillis: number } }
    | { type: 'SET_VOLUME'; payload: { sound: unknown; volume: number } }
    | { type: 'SET_RATE'; payload: { sound: unknown; rate: number } }
    | { type: 'PRELOAD'; payload: PreloadCommand }
    | { type: 'UNLOAD'; payload: void }
    | { type: 'CLEAR_CACHE'; payload: void };

export interface PlayCommand {
    id: string;
    source: SoundSourceValue;
    volume?: number;
    rate?: number;
    isLooping?: boolean;
    positionMillis?: number;
}

export interface PreloadCommand {
    id: string;
    source: SoundSourceValue;
    volume?: number;
    rate?: number;
    isLooping?: boolean;
}

// ===== Generic Command Processor =====
export class SoundCommandProcessor {
    private currentSound: unknown | null = null;
    private currentId: string | null = null;
    private currentStatusUpdater: ((status: PlaybackStatus) => void) | null = null;
    private isPlaying = false;

    constructor(
        private readonly audioService: IAudioService,
        private readonly cache: ISoundCache,
        private readonly events: SoundEvents
    ) {}

    async execute(command: SoundCommand): Promise<void> {
        try {
            await this.handleCommand(command);
        } catch (error) {
            if (error instanceof SoundError) throw error;
            throw SoundError.playbackFailed(error);
        }
    }

    private async handleCommand(command: SoundCommand): Promise<void> {
        switch (command.type) {
            case 'PLAY':
                await this.handlePlay(command.payload);
                break;
            case 'PAUSE':
                await this.handlePause(command.payload);
                break;
            case 'RESUME':
                await this.handleResume(command.payload);
                break;
            case 'STOP':
                await this.handleStop(command.payload);
                break;
            case 'SEEK':
                await this.handleSeek(command.payload);
                break;
            case 'SET_VOLUME':
                await this.handleSetVolume(command.payload);
                break;
            case 'SET_RATE':
                await this.handleSetRate(command.payload);
                break;
            case 'PRELOAD':
                await this.handlePreload(command.payload);
                break;
            case 'UNLOAD':
                await this.handleUnload();
                break;
            case 'CLEAR_CACHE':
                await this.handleClearCache();
                break;
        }
    }

    // ===== Command Handlers =====
    private async handlePlay(payload: PlayCommand): Promise<void> {
        const { id, source, volume = 1.0, rate = 1.0, isLooping = false, positionMillis } = payload;

        // Toggle if same sound
        if (this.currentId === id && this.currentSound && this.isPlaying) {
            await this.audioService.pause(this.currentSound);
            this.isPlaying = false;
            this.events.emit('PLAYBACK_STOPPED');
            return;
        }

        // Cleanup current
        await this.unloadCurrent();

        // Try cache first
        const cached = this.cache.get(id);
        if (cached) {
            this.currentSound = cached.sound;
            this.cache.delete(id).catch((error) => Logger.warn('Failed to delete from cache', error));
        } else {
            const statusUpdater = (status: PlaybackStatus) => {
                this.events.emit('STATUS_UPDATE', status);
                this.isPlaying = status.isPlaying;
            };

            const { sound } = await this.audioService.createSound(
                source,
                { shouldPlay: true, isLooping, volume, rate, positionMillis },
                statusUpdater
            );

            this.currentSound = sound;
            this.currentStatusUpdater = statusUpdater;
        }

        await this.audioService.play(this.currentSound);
        this.currentId = id;
        this.isPlaying = true;

        this.events.emit('PLAYBACK_STARTED', {
            id,
            source,
            volume,
            rate,
            isLooping,
        });
    }

    private async handlePause(payload: { sound: unknown }): Promise<void> {
        if (!payload.sound) return;
        await this.audioService.pause(payload.sound);
        this.isPlaying = false;
        this.events.emit('PLAYBACK_STOPPED');
    }

    private async handleResume(payload: { sound: unknown }): Promise<void> {
        if (!payload.sound) return;
        await this.audioService.play(payload.sound);
        this.isPlaying = true;
    }

    private async handleStop(payload: { sound: unknown }): Promise<void> {
        if (!payload.sound) return;
        await this.audioService.stop(payload.sound);
        this.isPlaying = false;
        this.events.emit('PLAYBACK_STOPPED');
        this.events.emit('STATE_RESET');
    }

    private async handleSeek(payload: { sound: unknown; positionMillis: number }): Promise<void> {
        if (!payload.sound) return;
        await this.audioService.setPosition(payload.sound, payload.positionMillis);
    }

    private async handleSetVolume(payload: { sound: unknown; volume: number }): Promise<void> {
        if (!payload.sound) return;
        await this.audioService.setVolume(payload.sound, payload.volume);
        this.events.emit('VOLUME_CHANGED', payload.volume);
    }

    private async handleSetRate(payload: { sound: unknown; rate: number }): Promise<void> {
        if (!payload.sound) return;
        await this.audioService.setRate(payload.sound, payload.rate);
        this.events.emit('RATE_CHANGED', payload.rate);
    }

    private async handlePreload(payload: PreloadCommand): Promise<void> {
        const { id, source, volume = 1.0, rate = 1.0, isLooping = false } = payload;

        if (this.cache.has(id)) return;

        const { sound } = await this.audioService.createSound(
            source,
            { shouldPlay: false, isLooping, volume, rate },
            () => {}
        );

        await this.cache.set(id, { sound, source, loadedAt: Date.now() });
    }

    private async handleUnload(): Promise<void> {
        await this.unloadCurrent();
        this.events.emit('STATE_RESET');
    }

    private async handleClearCache(): Promise<void> {
        await this.cache.clear();
    }

    // ===== Private Helpers =====
    private async unloadCurrent(): Promise<void> {
        if (this.currentSound) {
            try {
                await this.audioService.unload(this.currentSound);
            } catch (error) {
                Logger.warn('Failed to unload sound', error);
            }
        }
        this.currentStatusUpdater = null;
        this.currentSound = null;
        this.currentId = null;
        this.isPlaying = false;
    }

    // ===== Public API =====
    getCurrentSound(): unknown | null {
        return this.currentSound;
    }

    getCurrentId(): string | null {
        return this.currentId;
    }
}
