// ============================================================
// TrLaucher — Storage Utility (Capacitor-compatible)
// Falls back to localStorage for web browser
// ============================================================

const isCapacitor = () => window.Capacitor !== undefined;

export const Storage = {
  async set(key, value) {
    const serialized = JSON.stringify(value);
    if (isCapacitor()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value: serialized });
    } else {
      localStorage.setItem(`trlaucher_${key}`, serialized);
    }
  },

  async get(key, fallback = null) {
    try {
      if (isCapacitor()) {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : fallback;
      } else {
        const raw = localStorage.getItem(`trlaucher_${key}`);
        return raw ? JSON.parse(raw) : fallback;
      }
    } catch {
      return fallback;
    }
  },

  async remove(key) {
    if (isCapacitor()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(`trlaucher_${key}`);
    }
  },
};
