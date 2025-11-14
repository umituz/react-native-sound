/**
 * Storage Service Interface
 *
 * Abstraction for remote storage providers (Firebase Storage, AWS S3, etc.)
 * SOLID: Interface Segregation - Only storage-related methods
 * DRY: Single interface for all storage providers
 *
 * Apps can implement this interface for their specific storage provider
 */

export interface IStorageService {
  /**
   * Get download URL for a storage path
   * @param storagePath - Path in storage (e.g., "sounds/ocean-waves.mp3")
   * @returns Promise resolving to download URL
   */
  getDownloadUrl(storagePath: string): Promise<string>;
}

