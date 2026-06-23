// ============================================================
// TrLaucher — Electron Main Wrapper (PC App)
// ============================================================

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable hardware acceleration by default
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-oop-rasterization');

let mainWindow;

import { exec } from 'child_process';

// Register IPC handlers
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('launch-minecraft', async (event, args) => {
  const { host, port } = args || {};
  return new Promise((resolve) => {
    // List of common launch commands on Linux/PC
    const commands = [
      'prismlauncher',
      'flatpak run org.prismlauncher.PrismLauncher',
      'minecraft-launcher',
      'flatpak run com.mojang.Minecraft',
      'multimc',
      'polymc',
      'mcpelauncher-ui-qt'
    ];

    if (process.platform === 'win32') {
      commands.push(`start minecraft://?addExternalServer=TrLaucher|${host || 'localhost'}:${port || 19132}`);
      commands.push('start minecraft://');
    } else if (process.platform === 'darwin') {
      commands.push(`open minecraft://?addExternalServer=TrLaucher|${host || 'localhost'}:${port || 19132}`);
      commands.push('open minecraft://');
    } else {
      commands.push(`xdg-open minecraft://?addExternalServer=TrLaucher|${host || 'localhost'}:${port || 19132}`);
      commands.push('xdg-open minecraft://');
    }

    let index = 0;
    function tryNext() {
      if (index >= commands.length) {
        resolve({ success: false, error: 'Không tìm thấy launcher Minecraft nào cài trên PC của bạn.' });
        return;
      }
      
      const cmd = commands[index];
      exec(cmd, (err) => {
        // If error code is 127 (command not found) or similar, keep searching
        if (err && (err.code === 127 || err.message.includes('not found') || err.message.includes('No such file'))) {
          index++;
          tryNext();
        } else {
          // If started successfully (even if it outputs logs or blocks), resolve success
          resolve({ success: true });
        }
      });
    }

    tryNext();
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "TrLaucher — Minecraft Launcher",
    backgroundColor: "#07090e",
    show: false, // Don't show the window until it's ready to prevent flash
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
      backgroundThrottling: true // Reduce RAM usage when app is in background
    }
  });

  // Load the built production build index.html file
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Low-memory optimizations on launch
app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
