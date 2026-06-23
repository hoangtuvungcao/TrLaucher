// ============================================================
// TrLaucher — Main App v2 (Real data, clean UI)
// ============================================================

import './css/base.css';
import './css/animations.css';
import './css/pages.css';

import { Auth } from './utils/auth.js';
import { renderAuth } from './pages/auth.js';
import { renderHome } from './pages/home.js';
import { renderProfile } from './pages/profile.js';
import { renderVersions } from './pages/versions.js';
import { renderServers } from './pages/servers.js';
import { renderMods } from './pages/mods.js';
import { renderSettings } from './pages/settings.js';
import { Toast } from './components/toast.js';
import { icon } from './components/icons.js';
import { Storage } from './utils/storage.js';
import { applyAppSettings } from './utils/settings-helper.js';

const PAGES = [
  { id: 'home',     label: 'Portal' },
  { id: 'versions', label: 'Versions' },
  { id: 'servers',  label: 'Servers' },
  { id: 'mods',     label: 'Mods' },
  { id: 'settings', label: 'System' },
];

let currentPage = 'home';
let currentAccount = null;

// ── Splash ─────────────────────────────────────────────────
async function hideSplash() {
  await new Promise(r => setTimeout(r, 1800));
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  splash.classList.add('out');
  await new Promise(r => setTimeout(r, 500));
  splash.remove();
}

// ── Layout ─────────────────────────────────────────────────
function buildLayout() {
  document.getElementById('app').innerHTML = `
    <div id="auth-screen" class="hidden"></div>
    <div id="toast-container"></div>

    <div id="main-layout" class="hidden">
      <header id="topbar">
        <div class="topbar-logo">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" class="logo-pickaxe">
            <path d="M16 4L26 9L16 14L6 9L16 4Z" fill="url(#cube-top)" opacity="0.95"/>
            <path d="M6 9L16 14V25L6 20V9Z" fill="url(#cube-left)" opacity="0.9"/>
            <path d="M16 14L26 9V20L16 25V14Z" fill="url(#cube-right)" opacity="0.9"/>
            <path d="M16 10L20 12L16 14L12 12L16 10Z" fill="#FFF" opacity="0.3"/>
            <defs>
              <linearGradient id="cube-top" x1="6" y1="9" x2="26" y2="9" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#34D399" />
                <stop offset="100%" stop-color="#059669" />
              </linearGradient>
              <linearGradient id="cube-left" x1="6" y1="9" x2="16" y2="25" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#059669" />
                <stop offset="100%" stop-color="#047857" />
              </linearGradient>
              <linearGradient id="cube-right" x1="16" y1="14" x2="26" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#10B981" />
                <stop offset="100%" stop-color="#064E3B" />
              </linearGradient>
            </defs>
          </svg>
          Tr<span>Launcher</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="topbar-btn" id="btn-notif" style="font-size: 10px; font-weight: 800; padding: 0 10px; width: auto; letter-spacing: 0.5px;">
            ALERTS
            <span class="badge hidden" id="notif-badge">0</span>
          </button>
          <div class="topbar-btn" id="btn-profile" title="Hồ sơ" style="width: auto; padding: 3px; border-radius: var(--r-md);">
            <div class="topbar-avatar-img" id="topbar-av">?</div>
          </div>
        </div>
      </header>

      <main id="page-content"></main>

      <nav id="bottom-nav">
        ${PAGES.map(p => `
          <div class="nav-item ${p.id === currentPage ? 'active' : ''}"
               data-page="${p.id}" id="nav-${p.id}">
            <span class="nav-label">${p.label}</span>
          </div>
        `).join('')}
      </nav>
    </div>
  `;
}

// ── Navigate ───────────────────────────────────────────────
async function navigate(pageId) {
  currentPage = pageId;

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  const content = document.getElementById('page-content');
  content.scrollTop = 0;

  switch (pageId) {
    case 'home':     await renderHome(content, currentAccount, navigate); break;
    case 'profile':  await renderProfile(content, currentAccount, refreshTopbar); break;
    case 'versions': await renderVersions(content); break;
    case 'servers':  await renderServers(content); break;
    case 'mods':     await renderMods(content); break;
    case 'settings': await renderSettings(content); break;
  }
}

// ── Topbar ─────────────────────────────────────────────────
function refreshTopbar() {
  const av = document.getElementById('topbar-av');
  if (!av || !currentAccount) return;
  if (currentAccount.skinData) {
    av.innerHTML = `<img src="${currentAccount.skinData}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" />`;
  } else {
    av.textContent = (currentAccount.displayName || 'P').charAt(0).toUpperCase();
  }
}

// ── Boot ───────────────────────────────────────────────────
async function boot() {
  // Load and apply theme/accent color settings on startup
  const settings = await Storage.get('settings', {});
  applyAppSettings(settings);

  buildLayout();

  const account = await Auth.getCurrentAccount();
  if (account) {
    currentAccount = account;
    await showApp();
  } else {
    await showAuth();
  }

  hideSplash(); // don't await — let it run in background
}

async function showAuth() {
  const authEl = document.getElementById('auth-screen');
  const mainEl = document.getElementById('main-layout');
  authEl.classList.remove('hidden');
  mainEl.classList.add('hidden');

  renderAuth(async (account) => {
    currentAccount = account;
    authEl.classList.add('hidden');
    await showApp();
  });
}

async function showApp() {
  const mainEl = document.getElementById('main-layout');
  mainEl.classList.remove('hidden');
  refreshTopbar();

  document.getElementById('btn-profile').addEventListener('click', () => navigate('profile'));
  document.getElementById('btn-notif').addEventListener('click', () => {
    Toast.info('Không có thông báo mới', '');
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  await navigate('home');
}

boot().catch(err => {
  console.error('Boot error:', err);
  document.body.innerHTML = `<div style="color:white;padding:20px;">Lỗi khởi động: ${err.message}</div>`;
});
