export interface CachedVoiceLine {
  text: string;
  role: string;
  voiceId: string;
  response: {
    audio_base64: string;
    alignment: {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };
    normalized_alignment: {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };
  };
}

const CACHE_KEY = "voicelines-cache";

export function getCachedVoiceLine(
  text: string,
  role: string
): CachedVoiceLine | null {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return null;

    const cache: CachedVoiceLine[] = JSON.parse(cacheData);
    return (
      cache.find((line) => line.text === text && line.role === role) || null
    );
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

export function cacheVoiceLine(voiceLine: CachedVoiceLine): void {
  try {
    let cache: CachedVoiceLine[] = [];
    const existingCache = localStorage.getItem(CACHE_KEY);

    if (existingCache) {
      cache = JSON.parse(existingCache);
    }

    // Check if this voice line already exists
    const existingIndex = cache.findIndex(
      (line) => line.text === voiceLine.text && line.role === voiceLine.role
    );

    if (existingIndex >= 0) {
      cache[existingIndex] = voiceLine;
    } else {
      cache.push(voiceLine);
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

// Utility function to clear the cache if needed
export function clearVoiceLineCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
