/**
 * Set Rate Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import { Rate } from '../../domain/value-objects/Rate';
import type { IAudioService } from '../interfaces/IAudioService';
import { SoundPresenter } from '../presenters/SoundPresenter';

interface SetRateInput {
    sound: unknown;
    rate: number;
}

export class SetRateUseCase extends BaseVoidUseCase<SetRateInput> {
    constructor(
        private readonly audioService: IAudioService,
        private readonly presenter: SoundPresenter
    ) {
        super();
    }

    protected async executeImpl(input: SetRateInput): Promise<void> {
        if (!input.sound) return;

        const rate = new Rate(input.rate);
        await this.audioService.setRate(input.sound, rate.getValue());
        this.presenter.onRateChange(rate.getValue());
    }
}
