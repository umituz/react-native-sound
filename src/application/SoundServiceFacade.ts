/**
 * Sound Service Facade - Simplified Interface
 */

import { AudioConfig } from '../infrastructure/AudioConfig';
import { ExpoAudioService } from '../infrastructure/ExpoAudioService';
import { SoundCache } from '../infrastructure/SoundCache';
import { SoundPresenter } from './presenters/SoundPresenter';
import { PlaySoundUseCase } from './use-cases/PlaySoundUseCase';
import { PauseSoundUseCase } from './use-cases/PauseSoundUseCase';
import { ResumeSoundUseCase } from './use-cases/ResumeSoundUseCase';
import { StopSoundUseCase } from './use-cases/StopSoundUseCase';
import { SeekSoundUseCase } from './use-cases/SeekSoundUseCase';
import { SetVolumeUseCase } from './use-cases/SetVolumeUseCase';
import { SetRateUseCase } from './use-cases/SetRateUseCase';
import { PreloadSoundUseCase } from './use-cases/PreloadSoundUseCase';
import { ClearCacheUseCase } from './use-cases/ClearCacheUseCase';

export class SoundServiceFacade {
    private static instance: SoundServiceFacade | null = null;

    private readonly audioService = new ExpoAudioService();
    private readonly cache = new SoundCache(this.audioService);
    private readonly presenter: SoundPresenter;

    private readonly playUseCase: PlaySoundUseCase;
    private readonly pauseUseCase: PauseSoundUseCase;
    private readonly resumeUseCase: ResumeSoundUseCase;
    private readonly stopUseCase: StopSoundUseCase;
    private readonly seekUseCase: SeekSoundUseCase;
    private readonly setVolumeUseCase: SetVolumeUseCase;
    private readonly setRateUseCase: SetRateUseCase;
    private readonly preloadUseCase: PreloadSoundUseCase;
    private readonly clearCacheUseCase: ClearCacheUseCase;

    private constructor(store: SoundPresenter['store']) {
        AudioConfig.configure().catch(() => {});

        this.presenter = new SoundPresenter(store);

        this.playUseCase = new PlaySoundUseCase(this.audioService, this.cache, this.presenter);
        this.pauseUseCase = new PauseSoundUseCase(this.audioService, this.presenter);
        this.resumeUseCase = new ResumeSoundUseCase(this.audioService, this.presenter);
        this.stopUseCase = new StopSoundUseCase(this.audioService, this.presenter);
        this.seekUseCase = new SeekSoundUseCase(this.audioService);
        this.setVolumeUseCase = new SetVolumeUseCase(this.audioService, this.presenter);
        this.setRateUseCase = new SetRateUseCase(this.audioService, this.presenter);
        this.preloadUseCase = new PreloadSoundUseCase(this.audioService, this.cache);
        this.clearCacheUseCase = new ClearCacheUseCase(this.cache);
    }

    static create(store: SoundPresenter['store']): SoundServiceFacade {
        if (!this.instance) {
            this.instance = new SoundServiceFacade(store);
        }
        return this.instance;
    }

    async play(id: string, source: any, options?: any): Promise<void> {
        await this.playUseCase.execute({ id, source, ...options });
    }

    async pause(): Promise<void> {
        const sound = this.playUseCase.getCurrentSound();
        await this.pauseUseCase.execute({ sound });
    }

    async resume(): Promise<void> {
        const sound = this.playUseCase.getCurrentSound();
        await this.resumeUseCase.execute({ sound });
    }

    async stop(): Promise<void> {
        const sound = this.playUseCase.getCurrentSound();
        await this.stopUseCase.execute({ sound });
    }

    async seek(positionMillis: number): Promise<void> {
        const sound = this.playUseCase.getCurrentSound();
        await this.seekUseCase.execute({ sound, positionMillis });
    }

    async setVolume(volume: number): Promise<void> {
        const sound = this.playUseCase.getCurrentSound();
        await this.setVolumeUseCase.execute({ sound, volume });
    }

    async setRate(rate: number): Promise<void> {
        const sound = this.playUseCase.getCurrentSound();
        await this.setRateUseCase.execute({ sound, rate });
    }

    async preload(id: string, source: any, options?: any): Promise<void> {
        await this.preloadUseCase.execute({ id, source, ...options });
    }

    async unload(): Promise<void> {
        await this.playUseCase.unload();
    }

    clearCache(): void {
        this.clearCacheUseCase.execute();
    }

    isCached(id: string): boolean {
        return this.cache.has(id);
    }

    getCurrentId(): string | null {
        return this.playUseCase.getCurrentId();
    }
}
