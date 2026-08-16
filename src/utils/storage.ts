const API_KEY_STORAGE_KEY = 'ai_song_writer_gemini_key';
const API_KEY_SESSION_KEY = 'ai_song_writer_session_gemini_key';

let memoryApiKey: string | null = null;

export function getStoredApiKey(): string | null {
  if (memoryApiKey && memoryApiKey.trim()) {
    return memoryApiKey.trim();
  }

  try {
    const sessionKey = sessionStorage.getItem(API_KEY_SESSION_KEY);
    if (sessionKey && sessionKey.trim()) {
      memoryApiKey = sessionKey.trim();
      return memoryApiKey;
    }
  } catch {
    // sessionStorage not available
  }

  try {
    const localKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (localKey && localKey.trim()) {
      memoryApiKey = localKey.trim();
      return memoryApiKey;
    }
  } catch {
    // localStorage not available
  }

  return null;
}

export function setStoredApiKey(key: string, remember: boolean): void {
  const trimmed = key ? key.trim() : '';
  memoryApiKey = trimmed || null;

  try {
    if (trimmed) {
      sessionStorage.setItem(API_KEY_SESSION_KEY, trimmed);
    } else {
      sessionStorage.removeItem(API_SESSION_KEY());
    }
  } catch {
    // sessionStorage not available
  }

  try {
    if (remember && trimmed) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to access localStorage:', e);
  }
}

function API_SESSION_KEY() {
  return API_KEY_SESSION_KEY;
}

export function removeStoredApiKey(): void {
  memoryApiKey = null;
  try {
    sessionStorage.removeItem(API_KEY_SESSION_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove stored API key:', e);
  }
}
