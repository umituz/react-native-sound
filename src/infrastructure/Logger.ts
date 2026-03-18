/**
 * Logging Service
 */

export class Logger {
    static debug(message: string, ...args: unknown[]): void {
        if (__DEV__) {
            console.log(`[Sound] ${message}`, ...args);
        }
    }

    static warn(message: string, ...args: unknown[]): void {
        if (__DEV__) {
            console.warn(`[Sound] ${message}`, ...args);
        }
    }

    static error(message: string, error?: unknown): void {
        if (__DEV__) {
            console.error(`[Sound] ${message}`, error);
        }
    }
}
