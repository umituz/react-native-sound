---
name: setup-react-native-sound
description: Sets up audio playback and caching for React Native apps with support for multiple formats and background playback. Triggers on: Setup sound, audio player, sound playback, audio caching, useSound, playSound, background audio.
---

# Setup React Native Sound

Comprehensive setup for `@umituz/react-native-sound` - Audio playback and caching.

## Overview

This skill handles audio integration:
- Package installation
- Sound playback
- Audio caching
- Background playback
- Multiple format support

## Quick Start

Say: **"Setup sound playback in my app"**

## Step 1: Install

```bash
npm install @umituz/react-native-sound@latest
npm install expo-av
```

## Step 2: Use Sound Hook

```typescript
import { useSound } from '@umituz/react-native-sound';

export function AudioPlayer() {
  const { play, pause, stop, isLoading } = useSound({
    sound: require('./assets/sound.mp3'),
    enableCaching: true,
  });

  return (
    <View>
      <Button title="Play" onPress={play} />
      <Button title="Pause" onPress={pause} />
    </View>
  );
}
```

## Features

- **Playback** - Play, pause, stop, seek
- **Caching** - Cache audio files
- **Background** - Play in background
- **Formats** - MP3, WAV, AAC, OGG

## Verification

- ✅ Package installed
- ✅ Audio plays
- ✅ Controls work
- ✅ Caching works

---

**Compatible with:** @umituz/react-native-sound@latest
**Platforms:** React Native (Expo & Bare)
