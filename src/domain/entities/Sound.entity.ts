/**
 * Sound Entity
 *
 * Generic sound entity that can represent any audio file.
 * SOLID: Single Responsibility - Only defines sound data structure
 * KISS: Simple interface with essential properties
 */

export interface Sound {
  /** Unique identifier for the sound */
  id: string;

  /** Display name of the sound */
  name: string;

  /** Optional description */
  description?: string;

  /** Filename for local caching (e.g., "ocean-waves.mp3") */
  filename?: string;

  /** Remote storage path or URL (e.g., "sounds/ocean-waves.mp3" or "https://...") */
  storageUrl?: string;

  /** Local asset reference (for bundled sounds) */
  localAsset?: number;

  /** Duration in seconds (optional) */
  durationSeconds?: number;

  /** Whether sound is premium/paid */
  isPremium?: boolean;

  /** Category or tags for organization */
  category?: string;
  tags?: string[];

  /** Metadata for app-specific use */
  metadata?: Record<string, unknown>;
}

/**
 * Audio Source Type
 * Can be a local asset (number) or remote URI (string)
 */
export type AudioSource = number | { uri: string };

/**
 * Sound Playback Options
 */
export interface SoundPlaybackOptions {
  /** Whether to loop the sound */
  isLooping?: boolean;

  /** Initial volume (0.0 to 1.0) */
  volume?: number;

  /** Whether to play immediately */
  shouldPlay?: boolean;

  /** Playback rate (1.0 = normal speed) */
  rate?: number;
}

/**
 * Sound Cache Info
 */
export interface SoundCacheInfo {
  /** Local file URI if cached */
  cachedUri: string | null;

  /** Whether sound is currently cached */
  isCached: boolean;

  /** Cache size in bytes */
  cacheSize?: number;
}

