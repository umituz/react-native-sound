/**
 * Resume Sound Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import type { IAudioService } from '../interfaces/IAudioService';
import { SoundPresenter } from '../presenters/SoundPresenter';

interface ResumeSoundInput {
    sound: unknown;
}

export class ResumeSoundUseCase extends BaseVoidUseCase<ResumeSoundInput> {
    constructor(
        private readonly audioService: IAudioService,
        private readonly presenter: SoundPresenter
    ) {
        super();
    }

    protected async executeImpl(input: ResumeSoundInput): Promise<void> {
        if (!input.sound) return;
        await this.audioService.play(input.sound);
    }
}
