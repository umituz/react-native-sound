/**
 * Play Sound Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import { SoundId } from '../../domain/value-objects/SoundId';
import { SoundSource } from '../../domain/value-objects/SoundSource';
import { Volume } from '../../domain/value-objects/Volume';
import { Rate } from '../../domain/value-objects/Rate';
import type { IAudioService } from '../interfaces/IAudioService';
import type { ISoundCache } from '../interfaces/ISoundCache';
import { SoundPresenter } from '../presenters/SoundPresenter';

interface PlaySoundInput {
    id: string;
    source: number | { uri: string; headers?: Record<string, string> };
    volume?: number;
    rate?: number;
    isLooping?: boolean;
    positionMillis?: number;
}

export class PlaySoundUseCase extends BaseVoidUseCase<PlaySoundInput> {
    private currentSound: unknown | null = null;
    private currentId: string | null = null;

    constructor(
        private readonly audioService: IAudioService,
        private readonly cache: ISoundCache,
        private readonly presenter: SoundPresenter
    ) {
        super();
    }

    protected async executeImpl(input: PlaySoundInput): Promise<void> {
        const soundId = new SoundId(input.id);
        const soundSource = new SoundSource(input.source);
        const volume = new Volume(input.volume ?? 1.0);
        const rate = new Rate(input.rate ?? 1.0);

        // Toggle if same sound
        if (this.currentId === soundId.toString() && this.currentSound) {
            const status = await this.audioService.getStatus(this.currentSound);
            if (status?.isPlaying) {
                await this.audioService.pause(this.currentSound);
                this.presenter.onPlaybackStop();
                return;
            }
        }

        // Unload current
        if (this.currentSound) {
            await this.audioService.unload(this.currentSound);
        }

        // Try cache first
        const cached = this.cache.get(soundId.toString());
        if (cached) {
            this.currentSound = cached.sound;
            this.cache.delete(soundId.toString());
        } else {
            const { sound } = await this.audioService.createSound(
                soundSource.getValue(),
                {
                    shouldPlay: true,
                    isLooping: input.isLooping ?? false,
                    volume: volume.getValue(),
                    rate: rate.getValue(),
                    positionMillis: input.positionMillis,
                },
                (status) => this.presenter.onPlaybackUpdate(status)
            );
            this.currentSound = sound;
        }

        await this.audioService.play(this.currentSound);
        this.currentId = soundId.toString();

        this.presenter.onPlaybackStart(
            soundId.toString(),
            soundSource.getValue(),
            {
                volume: volume.getValue(),
                rate: rate.getValue(),
                isLooping: input.isLooping ?? false,
            }
        );
    }

    getCurrentSound(): unknown | null {
        return this.currentSound;
    }

    getCurrentId(): string | null {
        return this.currentId;
    }

    async unload(): Promise<void> {
        if (this.currentSound) {
            await this.audioService.unload(this.currentSound);
        }
        this.currentSound = null;
        this.currentId = null;
        this.presenter.onReset();
    }
}
