/**
 * Preload Sound Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import { SoundId } from '../../domain/value-objects/SoundId';
import { SoundSource } from '../../domain/value-objects/SoundSource';
import { Volume } from '../../domain/value-objects/Volume';
import { Rate } from '../../domain/value-objects/Rate';
import type { IAudioService } from '../interfaces/IAudioService';
import type { ISoundCache } from '../interfaces/ISoundCache';

interface PreloadSoundInput {
    id: string;
    source: number | { uri: string; headers?: Record<string, string> };
    volume?: number;
    rate?: number;
    isLooping?: boolean;
}

export class PreloadSoundUseCase extends BaseVoidUseCase<PreloadSoundInput> {
    constructor(
        private readonly audioService: IAudioService,
        private readonly cache: ISoundCache
    ) {
        super();
    }

    protected async executeImpl(input: PreloadSoundInput): Promise<void> {
        const soundId = new SoundId(input.id);
        const soundSource = new SoundSource(input.source);
        const volume = new Volume(input.volume ?? 1.0);
        const rate = new Rate(input.rate ?? 1.0);

        if (this.cache.has(soundId.toString())) {
            return;
        }

        const { sound } = await this.audioService.createSound(
            soundSource.getValue(),
            {
                shouldPlay: false,
                isLooping: input.isLooping ?? false,
                volume: volume.getValue(),
                rate: rate.getValue(),
            },
            () => {}
        );

        this.cache.set(soundId.toString(), {
            sound,
            source: soundSource.getValue(),
            loadedAt: Date.now(),
        });
    }
}
