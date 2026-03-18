/**
 * Seek Sound Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import { PlaybackPosition } from '../../domain/value-objects/PlaybackPosition';
import type { IAudioService } from '../interfaces/IAudioService';

interface SeekSoundInput {
    sound: unknown;
    positionMillis: number;
    durationMillis?: number;
}

export class SeekSoundUseCase extends BaseVoidUseCase<SeekSoundInput> {
    constructor(private readonly audioService: IAudioService) {
        super();
    }

    protected async executeImpl(input: SeekSoundInput): Promise<void> {
        if (!input.sound) return;

        const position = new PlaybackPosition(input.positionMillis, input.durationMillis);
        await this.audioService.setPosition(input.sound, position.getValue());
    }
}
