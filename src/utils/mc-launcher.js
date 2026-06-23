// ============================================================
// TrLaucher — Real Minecraft Launcher Utility
// Launches actual Minecraft PE app via Capacitor AppLauncher
// ============================================================

const MC_PACKAGE = 'com.mojang.minecraftpe';
const PLAYSTORE_URL = `market://details?id=${MC_PACKAGE}`;

export const MinecraftLauncher = {
  /**
   * Check if Minecraft PE is installed on the device.
   * Works only in Capacitor (native Android). In browser/Electron, returns true or null.
   */
  async isInstalled() {
    if (window.electronAPI) return true;
    try {
      if (!window.Capacitor) return null; // browser mode — unknown
      const { AppLauncher } = await import('@capacitor/app-launcher');
      const { value } = await AppLauncher.canOpenUrl({ url: MC_PACKAGE });
      return value;
    } catch {
      return null;
    }
  },

  /**
   * Launch Minecraft PE.
   * @returns { success: boolean, reason?: string }
   */
  async launch() {
    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.launchMinecraft();
        if (res.success) return { success: true };
        return { success: false, reason: 'error', message: res.error };
      }
      if (!window.Capacitor) {
        return { success: false, reason: 'browser' };
      }
      const { AppLauncher } = await import('@capacitor/app-launcher');

      const { value: canOpen } = await AppLauncher.canOpenUrl({ url: MC_PACKAGE });
      if (!canOpen) {
        return { success: false, reason: 'not_installed' };
      }

      await AppLauncher.openUrl({ url: MC_PACKAGE });
      return { success: true };
    } catch (err) {
      return { success: false, reason: 'error', message: err.message };
    }
  },

  /**
   * Open Google Play Store to install Minecraft PE.
   */
  async openPlayStore() {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openExternal(`https://play.google.com/store/apps/details?id=${MC_PACKAGE}`);
        return;
      }
      if (!window.Capacitor) {
        window.open(`https://play.google.com/store/apps/details?id=${MC_PACKAGE}`, '_blank');
        return;
      }
      const { AppLauncher } = await import('@capacitor/app-launcher');
      await AppLauncher.openUrl({ url: PLAYSTORE_URL });
    } catch {
      window.open(`https://play.google.com/store/apps/details?id=${MC_PACKAGE}`, '_blank');
    }
  },

  /**
   * Launch Minecraft PE with a server connection intent.
   * Uses minecraft:// scheme to attempt server auto-connect.
   */
  async launchWithServer(host, port = 19132) {
    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.launchMinecraft(host, port);
        if (res.success) return { success: true };
        return { success: false, reason: 'error', message: res.error };
      }
      if (!window.Capacitor) {
        return { success: false, reason: 'browser' };
      }
      const { AppLauncher } = await import('@capacitor/app-launcher');

      // Try minecraft:// scheme for server connect
      const serverUrl = `minecraft://?addExternalServer=TrLaucher|${host}:${port}`;
      await AppLauncher.openUrl({ url: serverUrl });
      return { success: true };
    } catch {
      // Fallback: just launch the game
      return this.launch();
    }
  },
};
