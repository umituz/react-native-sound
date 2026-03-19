/**
 * Event Bus - Eliminates Presenter Pattern
 * Direct communication between commands and store
 */

import type { PlaybackStatus } from './interfaces/IAudioService';
import type { SoundSourceValue } from '../domain/value-objects';
import { Logger } from '../infrastructure/Logger';

// ===== Event Types =====
export type SoundEvent =
    | { type: 'PLAYBACK_STARTED'; payload: PlaybackStartedEvent }
    | { type: 'PLAYBACK_STOPPED' }
    | { type: 'STATUS_UPDATE'; payload: PlaybackStatus }
    | { type: 'VOLUME_CHANGED'; payload: number }
    | { type: 'RATE_CHANGED'; payload: number }
    | { type: 'STATE_RESET' }
    | { type: 'ERROR'; payload: string };

export interface PlaybackStartedEvent {
    id: string;
    source: SoundSourceValue;
    volume: number;
    rate: number;
    isLooping: boolean;
}

// ===== Event Bus Implementation =====
type EventListener = (payload: unknown) => void;

export class SoundEvents {
    private listeners = new Map<string, Set<EventListener>>();

    on(eventType: string, listener: EventListener): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            listeners.add(listener);
        }

        // Return unsubscribe function
        return () => {
            this.off(eventType, listener);
        };
    }

    off(eventType: string, listener: EventListener): void {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
            eventListeners.delete(listener);
        }
    }

    emit<T = unknown>(eventType: string, payload?: T): void {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
            eventListeners.forEach((listener) => {
                try {
                    listener(payload as T);
                } catch (error) {
                    Logger.error(`Error in event listener for ${eventType}`, error);
                }
            });
        }
    }

    clear(): void {
        this.listeners.clear();
    }

    // ===== Convenience Methods =====
    emitPlaybackStarted(event: PlaybackStartedEvent): void {
        this.emit('PLAYBACK_STARTED', event);
    }

    emitPlaybackStopped(): void {
        this.emit('PLAYBACK_STOPPED');
    }

    emitStatusUpdate(status: PlaybackStatus): void {
        this.emit('STATUS_UPDATE', status);
    }

    emitVolumeChanged(volume: number): void {
        this.emit('VOLUME_CHANGED', volume);
    }

    emitRateChanged(rate: number): void {
        this.emit('RATE_CHANGED', rate);
    }

    emitStateReset(): void {
        this.emit('STATE_RESET');
    }

    emitError(error: string): void {
        this.emit('ERROR', error);
    }
}
