/**
 * Base Use Case - Common Error Handling
 */

import { SoundError } from '../../domain/errors/SoundError';
import { Logger } from '../../infrastructure/Logger';

export abstract class BaseUseCase<TInput, TOutput> {
    async execute(input: TInput): Promise<TOutput> {
        try {
            return await this.executeImpl(input);
        } catch (error) {
            if (error instanceof SoundError) {
                throw error;
            }
            throw SoundError.playbackFailed(error);
        }
    }

    protected abstract executeImpl(input: TInput): Promise<TOutput>;
}

export abstract class BaseVoidUseCase<TInput> {
    async execute(input: TInput): Promise<void> {
        try {
            await this.executeImpl(input);
        } catch (error) {
            if (error instanceof SoundError) {
                throw error;
            }
            throw SoundError.playbackFailed(error);
        }
    }

    protected abstract executeImpl(input: TInput): Promise<void>;
}
