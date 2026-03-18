/**
 * Sound Source Value Object
 */

import { SoundError } from '../errors/SoundError';

export type SoundSourceValue = number | { uri: string; headers?: Record<string, string> };

export class SoundSource {
    private readonly value: SoundSourceValue;

    constructor(value: SoundSourceValue | null | undefined) {
        if (value === null || value === undefined) {
            throw SoundError.invalidSoundSource();
        }
        this.value = value;
    }

    getValue(): SoundSourceValue {
        return this.value;
    }

    isLocal(): boolean {
        return typeof this.value === 'number';
    }

    isRemote(): boolean {
        return typeof this.value === 'object' && 'uri' in this.value;
    }
}
