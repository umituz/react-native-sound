/**
 * Sound ID Value Object
 */

export class SoundId {
    private readonly value: string;

    constructor(value: string) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Sound id must be a non-empty string');
        }
        this.value = value.trim();
    }

    toString(): string {
        return this.value;
    }

    equals(other: SoundId): boolean {
        return this.value === other.value;
    }
}
