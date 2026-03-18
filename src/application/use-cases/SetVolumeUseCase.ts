/**
 * Set Volume Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import { Volume } from '../../domain/value-objects/Volume';
import type { IAudioService } from '../interfaces/IAudioService';
import { SoundPresenter } from '../presenters/SoundPresenter';

interface SetVolumeInput {
    sound: unknown;
    volume: number;
}

export class SetVolumeUseCase extends BaseVoidUseCase<SetVolumeInput> {
    constructor(
        private readonly audioService: IAudioService,
        private readonly presenter: SoundPresenter
    ) {
        super();
    }

    protected async executeImpl(input: SetVolumeInput): Promise<void> {
        if (!input.sound) return;

        const volume = new Volume(input.volume);
        await this.audioService.setVolume(input.sound, volume.getValue());
        this.presenter.onVolumeChange(volume.getValue());
    }
}
