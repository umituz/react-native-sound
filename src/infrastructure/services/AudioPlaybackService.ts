/**
 * Audio Playback Service
 *
 * Handles audio playback using expo-av.
 * SOLID: Single Responsibility - Only handles audio playback
 * KISS: Simple wrapper around expo-av
 */

import { Audio } from 'expo-av';
import type { AudioSource, SoundPlaybackOptions } from '../../domain/entities/Sound.entity';

export interface AudioPlaybackResult {
  sound: Audio.Sound;
  isStreaming: boolean;
}

export class AudioPlaybackService {
  /**
   * Configure audio session for playback
   * KISS: Simple configuration wrapper
   *
   * @param options - Audio session options
   */
  async configureAudioSession(options?: {
    playsInSilentModeIOS?: boolean;
    allowsRecordingIOS?: boolean;
    staysActiveInBackground?: boolean;
  }): Promise<void> {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: options?.playsInSilentModeIOS ?? true,
      allowsRecordingIOS: options?.allowsRecordingIOS ?? false,
      interruptionModeIOS: 2, // DuckOthers
      interruptionModeAndroid: 1, // DuckOthers
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: options?.staysActiveInBackground ?? false,
    });
  }

  /**
   * Create and load audio sound
   * @param source - Audio source (local asset or URI)
   * @param options - Playback options
   * @returns Audio sound instance
   */
  async loadSound(
    source: AudioSource,
    options: SoundPlaybackOptions = {}
  ): Promise<Audio.Sound> {
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: options.shouldPlay ?? false,
      isLooping: options.isLooping ?? false,
      volume: options.volume ?? 1.0,
      rate: options.rate ?? 1.0,
    });

    return sound;
  }

  /**
   * Play audio sound
   * @param sound - Audio sound instance
   */
  async playSound(sound: Audio.Sound): Promise<void> {
    await sound.playAsync();
  }

  /**
   * Pause audio sound
   * @param sound - Audio sound instance
   */
  async pauseSound(sound: Audio.Sound): Promise<void> {
    await sound.pauseAsync();
  }

  /**
   * Stop and unload audio sound
   * @param sound - Audio sound instance
   */
  async stopSound(sound: Audio.Sound): Promise<void> {
    await sound.unloadAsync();
  }

  /**
   * Set volume
   * @param sound - Audio sound instance
   * @param volume - Volume (0.0 to 1.0)
   */
  async setVolume(sound: Audio.Sound, volume: number): Promise<void> {
    await sound.setVolumeAsync(volume);
  }

  /**
   * Set playback rate
   * @param sound - Audio sound instance
   * @param rate - Playback rate (1.0 = normal speed)
   */
  async setRate(sound: Audio.Sound, rate: number): Promise<void> {
    await sound.setRateAsync(rate, true);
  }
}

// Export singleton instance
export const audioPlaybackService = new AudioPlaybackService();

