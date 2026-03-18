/**
 * Stop Sound Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import type { IAudioService } from '../interfaces/IAudioService';
import { SoundPresenter } from '../presenters/SoundPresenter';

interface StopSoundInput {
    sound: unknown;
}

export class StopSoundUseCase extends BaseVoidUseCase<StopSoundInput> {
    constructor(
        private readonly audioService: IAudioService,
        private readonly presenter: SoundPresenter
    ) {
        super();
    }

    protected async executeImpl(input: StopSoundInput): Promise<void> {
        if (!input.sound) return;
        await this.audioService.stop(input.sound);
        this.presenter.onPlaybackStop();
        this.presenter.onReset();
    }
}
