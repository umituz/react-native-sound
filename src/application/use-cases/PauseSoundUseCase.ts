/**
 * Pause Sound Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import type { IAudioService } from '../interfaces/IAudioService';
import { SoundPresenter } from '../presenters/SoundPresenter';

interface PauseSoundInput {
    sound: unknown;
}

export class PauseSoundUseCase extends BaseVoidUseCase<PauseSoundInput> {
    constructor(
        private readonly audioService: IAudioService,
        private readonly presenter: SoundPresenter
    ) {
        super();
    }

    protected async executeImpl(input: PauseSoundInput): Promise<void> {
        if (!input.sound) return;
        await this.audioService.pause(input.sound);
        this.presenter.onPlaybackStop();
    }
}
