/**
 * Clear Cache Use Case
 */

import { BaseVoidUseCase } from './BaseUseCase';
import type { ISoundCache } from '../interfaces/ISoundCache';

export class ClearCacheUseCase extends BaseVoidUseCase<void> {
    constructor(private readonly cache: ISoundCache) {
        super();
    }

    protected async executeImpl(): Promise<void> {
        this.cache.clear();
    }
}
