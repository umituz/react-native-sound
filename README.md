# @umituz/react-native-sound

Universal sound playback and caching library for React Native apps. Supports local assets, remote URLs, and automatic caching with a simple, clean API.

## Features

- 🎵 **Universal Sound Playback** - Play sounds from local assets or remote URLs
- 💾 **Automatic Caching** - Cache remote sounds locally for offline playback
- 🔄 **Streaming Support** - Stream sounds while downloading in background
- 🎛️ **Playback Controls** - Play, pause, stop, volume, and rate control
- 🎯 **Singleton Pattern** - Only one sound plays at a time across the app
- 🔌 **Storage Abstraction** - Works with any storage provider (Firebase, AWS S3, etc.)
- 📦 **Zero Dependencies** - Only requires `expo-av` and `expo-file-system`

## Installation

```bash
npm install @umituz/react-native-sound
```

## Peer Dependencies

```bash
npm install expo-av expo-file-system
```

## Quick Start

### Basic Usage

```typescript
import { useSoundPlayback, Sound } from '@umituz/react-native-sound';

function MyComponent() {
  const { playSound, stopSound, isPlaying } = useSoundPlayback();

  const sound: Sound = {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    filename: 'ocean-waves.mp3',
    storageUrl: 'sounds/ocean-waves.mp3', // Or full URL
  };

  return (
    <Button
      onPress={() => {
        if (isPlaying(sound.id)) {
          stopSound();
        } else {
          playSound(sound);
        }
      }}
    >
      {isPlaying(sound.id) ? 'Stop' : 'Play'}
    </Button>
  );
}
```

### With Storage Service (Firebase, AWS S3, etc.)

```typescript
import { useSoundPlayback, IStorageService } from '@umituz/react-native-sound';
import { getStorage } from 'firebase/storage';
import { ref, getDownloadURL } from 'firebase/storage';

// Implement storage service
class FirebaseStorageService implements IStorageService {
  async getDownloadUrl(storagePath: string): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
  }
}

function MyComponent() {
  const storageService = new FirebaseStorageService();
  const { playSound, stopSound } = useSoundPlayback({
    storageService,
  });

  // ... rest of component
}
```

### Local Assets

```typescript
import { useSoundPlayback, Sound } from '@umituz/react-native-sound';
import oceanWavesSound from './assets/sounds/ocean-waves.mp3';

function MyComponent() {
  const { playSound } = useSoundPlayback();

  const sound: Sound = {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    localAsset: oceanWavesSound, // Bundled asset
  };

  return <Button onPress={() => playSound(sound)}>Play</Button>;
}
```

### Cache Management

```typescript
import { useSoundCache } from '@umituz/react-native-sound';

function CacheSettings() {
  const {
    cacheSize,
    clearCache,
    isCached,
    deleteCachedSound,
  } = useSoundCache();

  return (
    <View>
      <Text>Cache Size: {cacheSize.toFixed(2)} MB</Text>
      <Button onPress={clearCache}>Clear Cache</Button>
    </View>
  );
}
```

## API Reference

### `useSoundPlayback(options?)`

Main hook for sound playback.

#### Options

- `storageService?: IStorageService` - Storage service for remote URLs
- `autoConfigureAudioSession?: boolean` - Auto-configure audio session (default: true)
- `audioSessionOptions?: {...}` - Audio session configuration

#### Returns

- `playSound(sound, options?, onProgress?)` - Play a sound
- `stopSound()` - Stop current sound
- `pauseSound()` - Pause current sound
- `resumeSound()` - Resume paused sound
- `isPlaying(soundId)` - Check if sound is playing
- `playingSoundId` - Currently playing sound ID
- `downloadingSoundId` - Currently downloading sound ID
- `downloadProgress` - Download progress (0-100)
- `isStreaming` - Whether sound is streaming

### `useSoundCache()`

Hook for cache management.

#### Returns

- `isCached(sound)` - Check if sound is cached
- `getCachedUri(sound)` - Get cached file URI
- `clearCache()` - Clear all cache
- `getCacheSize()` - Get cache size in MB
- `deleteCachedSound(sound)` - Delete specific cached sound
- `cacheSize` - Current cache size in MB
- `isLoadingCacheSize` - Whether cache size is loading
- `refreshCacheSize()` - Refresh cache size

### `Sound` Entity

```typescript
interface Sound {
  id: string;                    // Required: Unique identifier
  name: string;                  // Required: Display name
  description?: string;          // Optional: Description
  filename?: string;             // Optional: Filename for caching
  storageUrl?: string;           // Optional: Remote storage path or URL
  localAsset?: number;           // Optional: Local asset reference
  durationSeconds?: number;      // Optional: Duration in seconds
  isPremium?: boolean;           // Optional: Premium flag
  category?: string;             // Optional: Category
  tags?: string[];               // Optional: Tags
  metadata?: Record<string, unknown>; // Optional: App-specific metadata
}
```

### `IStorageService` Interface

```typescript
interface IStorageService {
  getDownloadUrl(storagePath: string): Promise<string>;
}
```

Implement this interface for your storage provider (Firebase Storage, AWS S3, etc.).

## Architecture

This package follows Domain-Driven Design (DDD) principles:

- **Domain Layer**: Entities and interfaces
- **Infrastructure Layer**: Services and storage implementations
- **Presentation Layer**: React hooks

### SOLID Principles

- **Single Responsibility**: Each service has one clear purpose
- **Open/Closed**: Extensible through interfaces
- **Liskov Substitution**: Storage services are interchangeable
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depends on abstractions, not concretions

## Examples

### Multiple Sounds

```typescript
const sounds: Sound[] = [
  {
    id: 'ocean',
    name: 'Ocean Waves',
    filename: 'ocean.mp3',
    storageUrl: 'sounds/ocean.mp3',
  },
  {
    id: 'rain',
    name: 'Rain',
    filename: 'rain.mp3',
    storageUrl: 'sounds/rain.mp3',
  },
];

function SoundList() {
  const { playSound, isPlaying } = useSoundPlayback();

  return (
    <View>
      {sounds.map(sound => (
        <Button
          key={sound.id}
          onPress={() => playSound(sound)}
          disabled={isPlaying(sound.id)}
        >
          {sound.name}
        </Button>
      ))}
    </View>
  );
}
```

### Download Progress

```typescript
function SoundPlayer() {
  const { playSound, downloadProgress, downloadingSoundId } = useSoundPlayback();

  const handlePlay = (sound: Sound) => {
    playSound(
      sound,
      { isLooping: true },
      (progress) => {
        console.log(`Download: ${Math.round(progress * 100)}%`);
      }
    );
  };

  return (
    <View>
      {downloadingSoundId && (
        <ProgressBar value={downloadProgress} />
      )}
    </View>
  );
}
```

## License

MIT

## Author

Ümit UZ <umit@umituz.com>

