/**
 * Audio Configuration Service
 */

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Logger } from './Logger';

export class AudioConfig {
    static async configure(): Promise<void> {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            });
            Logger.debug('Audio configured successfully');
        } catch (error) {
            Logger.warn('Failed to configure audio session', error);
        }
    }
}
