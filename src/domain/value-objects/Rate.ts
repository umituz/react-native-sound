/**
 * Rate Value Object
 */

export class Rate {
    private readonly MIN = 0.5;
    private readonly MAX = 2.0;
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

    equals(other: Rate): boolean {
        return this.value === other.value;
    }
}
