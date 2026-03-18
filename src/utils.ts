/**
 * Utility Functions - Backward Compatibility
 */

import { Volume } from './domain/value-objects/Volume';
import { Rate } from './domain/value-objects/Rate';

export function clampVolume(volume: number): number {
    return new Volume(volume).getValue();
}

export function clampRate(rate: number): number {
    return new Rate(rate).getValue();
}

export function validateSoundId(id: string): boolean {
    return typeof id === 'string' && id.trim().length > 0;
}

export function isSoundSourceValid(source: any): boolean {
    return source !== null && source !== undefined;
}

export function isPlaybackStatusSuccess(status: any): boolean {
    return status.isLoaded === true;
}
