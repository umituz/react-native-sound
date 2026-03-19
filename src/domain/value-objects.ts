/**
 * Value Objects - Consolidated with Generic Base Class
 * Eliminates duplication across multiple files
 */

// ===== Generic Base Value Object =====
export abstract class ValueObject<T> {
    protected readonly value: T;

    constructor(value: T, validator?: (value: T) => void) {
        if (validator) validator(value);
        this.value = this.transform(value);
    }

    protected abstract transform(value: T): T;

    getValue(): T {
        return this.value;
    }

    equals(other: ValueObject<T>): boolean {
        return other instanceof this.constructor && this.value === other.value;
    }

    toString(): string {
        return String(this.value);
    }
}

// ===== Sound ID =====
export class SoundId extends ValueObject<string> {
    protected transform(value: string): string {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Sound id must be a non-empty string');
        }
        return value.trim();
    }

    override toString(): string {
        return this.value;
    }
}

// ===== Sound Source =====
export type SoundSourceValue = number | { uri: string; headers?: Record<string, string> };

export class SoundSource extends ValueObject<SoundSourceValue> {
    protected transform(value: SoundSourceValue): SoundSourceValue {
        if (value === null || value === undefined) {
            throw new Error('Sound source cannot be null or undefined');
        }
        return value;
    }

    isLocal(): boolean {
        return typeof this.value === 'number';
    }

    isRemote(): boolean {
        return typeof this.value === 'object' && 'uri' in this.value;
    }
}

// ===== Volume (0.0 - 1.0) =====
export class Volume extends ValueObject<number> {
    private readonly MIN = 0;
    private readonly MAX = 1;

    protected transform(value: number): number {
        if (!Number.isFinite(value)) return 1.0;
        return Math.max(this.MIN, Math.min(this.MAX, value));
    }
}

// ===== Playback Rate (0.5 - 2.0) =====
export class Rate extends ValueObject<number> {
    private readonly MIN = 0.5;
    private readonly MAX = 2.0;

    protected transform(value: number): number {
        if (!Number.isFinite(value)) return 1.0;
        return Math.max(this.MIN, Math.min(this.MAX, value));
    }
}

// ===== Playback Position =====
export class PlaybackPosition extends ValueObject<number> {
    constructor(value: number, private readonly duration?: number) {
        super(value);
    }

    protected transform(value: number): number {
        if (!Number.isFinite(value)) {
            throw new Error('Position must be a finite number');
        }
        return this.duration ? Math.max(0, Math.min(this.duration, value)) : value;
    }

    getDuration(): number | undefined {
        return this.duration;
    }
}

// ===== Factory for Batch Creation =====
export class SoundValueObjects {
    static create(params: {
        id: string;
        source: SoundSourceValue;
        volume?: number;
        rate?: number;
        position?: number;
        duration?: number;
    }): {
        id: SoundId;
        source: SoundSource;
        volume: Volume;
        rate: Rate;
        position?: PlaybackPosition;
    } {
        return {
            id: new SoundId(params.id),
            source: new SoundSource(params.source),
            volume: new Volume(params.volume ?? 1.0),
            rate: new Rate(params.rate ?? 1.0),
            position: params.position ? new PlaybackPosition(params.position, params.duration) : undefined,
        };
    }
}
