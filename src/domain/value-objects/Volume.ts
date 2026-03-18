/**
 * Volume Value Object
 */

export class Volume {
    private readonly MIN = 0;
    private readonly MAX = 1;
    private readonly value: number;

    constructor(value: number) {
        this.value = this.clamp(value);
    }

    private clamp(value: number): number {
        if (!Number.isFinite(value)) return 1.0;
        return Math.max(this.MIN, Math.min(this.MAX, value));
    }

    getValue(): number {
        return this.value;
    }

    equals(other: Volume): boolean {
        return this.value === other.value;
    }
}
