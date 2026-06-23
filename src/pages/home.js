// ============================================================
// TrLaucher — Home Page v2 (Real MC launch)
// ============================================================

import { initParticles } from '../components/particle-bg.js';
import { MinecraftLauncher } from '../utils/mc-launcher.js';
import { Toast } from '../components/toast.js';
import { icon } from '../components/icons.js';
import { Storage } from '../utils/storage.js';
import { VERSIONS } from './versions.js';

let cleanupFn = null;

export async function renderHome(container, account, navigate) {
  const activeEngine = await Storage.get('active_engine', 'bedrock');
  const mcInstalled = await MinecraftLauncher.isInstalled();
  
  // Versions
  const activeVersionId = await Storage.get('active_version', 'v1.21.80');
  const activeVer = VERSIONS.find(v => v.id === activeVersionId) || VERSIONS[0];

  const javaVer = '1.21.1'; // standard default Java version
  const displayVer = activeEngine === 'java' ? `Java ${javaVer}` : `Bedrock ${activeVer.name}`;

  container.innerHTML = `
    <div class="page-content">
      <div class="home-hero" id="home-hero">
      <div class="hero-content">
        <!-- Engine Toggle Selector -->
        <div class="engine-selector" style="display: inline-flex; background: rgba(0, 0, 0, 0.45); padding: 3px; border-radius: 99px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 16px; width: 100%; max-width: 260px;">
          <button class="engine-btn-toggle ${activeEngine === 'java' ? 'active' : ''}" data-engine="java" style="flex: 1; border: none; background: ${activeEngine === 'java' ? 'var(--green-subtle)' : 'transparent'}; color: ${activeEngine === 'java' ? 'var(--green)' : 'var(--text-3)'}; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 99px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;">Java Edition</button>
          <button class="engine-btn-toggle ${activeEngine === 'bedrock' ? 'active' : ''}" data-engine="bedrock" style="flex: 1; border: none; background: ${activeEngine === 'bedrock' ? 'var(--green-subtle)' : 'transparent'}; color: ${activeEngine === 'bedrock' ? 'var(--green)' : 'var(--text-3)'}; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 99px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;">Bedrock PE</button>
        </div>

        <div class="hero-badge" id="mc-status-badge">
          ${activeEngine === 'java'
            ? `<span class="status-dot online"></span><span>JAVA ENGINE · READY</span>`
            : mcInstalled === true
              ? `<span class="status-dot online"></span><span>MINECRAFT PE · READY</span>`
              : `<span class="status-dot offline"></span><span>MINECRAFT PE · NOT INSTALLED</span>`
          }
        </div>
        <h1 class="hero-title">Welcome, <span class="hero-name">${account?.displayName || 'Player'}</span></h1>
        <p class="hero-sub">Ready to launch your adventure?</p>

        ${activeEngine === 'bedrock' && mcInstalled === false ? `
          <button class="play-btn install-btn" id="btn-install-mc" style="justify-content: center; text-align: center; height: 50px;">
            <span class="play-btn-text" style="align-items: center; width: 100%;">
              <span class="play-btn-title">GET MINECRAFT PE</span>
              <span class="play-btn-sub">Install via Google Play Store</span>
            </span>
          </button>
        ` : `
          <button class="play-btn" id="btn-play" style="justify-content: center; text-align: center; height: 50px;">
            <span class="play-btn-text" style="align-items: center; width: 100%;">
              <span class="play-btn-title">LAUNCH GAME</span>
              <span class="play-btn-sub">${displayVer}</span>
            </span>
          </button>
        `}

        <div class="hero-grid">
          <div class="hero-stat-card" data-nav="versions">
            <div class="hsc-val">${activeEngine === 'java' ? javaVer : activeVer.name}</div>
            <div class="hsc-label">VERSION</div>
          </div>
          <div class="hero-stat-card" data-nav="servers">
            <div class="hsc-val">MULTIPLAYER</div>
            <div class="hsc-label">CONNECTIONS</div>
          </div>
          <div class="hero-stat-card" data-nav="mods">
            <div class="hsc-val">EXTENSIONS</div>
            <div class="hsc-label">ADDONS</div>
          </div>
        </div>
      </div>
    </div>

    <div style="padding: var(--s4);">
      <!-- Account card -->
      <div class="account-card mb-4" id="btn-goto-profile">
        <div class="acc-avatar" id="home-avatar" style="overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--grad-green); color: white; font-weight: 800;">
          ${account?.skinData
            ? `<img src="${account.skinData}" alt="avatar" style="width:100%;height:100%;object-fit:cover;" />`
            : (account?.displayName?.charAt(0)?.toUpperCase() || 'P')
          }
        </div>
        <div class="acc-info">
          <div class="acc-name">${account?.displayName || 'Player'}</div>
          <div class="acc-tag">LOCAL PROFILE · @${account?.username || 'user'}</div>
        </div>
        <span class="text-xs text-muted" style="font-weight:700;">EDIT</span>
      </div>

      <!-- Quick actions -->
      <div class="sec-head">
        <span class="sec-title">Quick Navigation</span>
      </div>
      <div class="quick-grid mb-4 stagger">
        <button class="quick-btn" data-nav="versions">
          <span style="font-weight: 800; color: var(--green);">VERSIONS</span>
        </button>
        <button class="quick-btn" data-nav="servers">
          <span style="font-weight: 800; color: var(--orange);">SERVERS</span>
        </button>
        <button class="quick-btn" data-nav="mods">
          <span style="font-weight: 800; color: var(--purple);">MODS</span>
        </button>
        <button class="quick-btn" data-nav="settings">
          <span style="font-weight: 800; color: var(--blue);">SYSTEM</span>
        </button>
      </div>

      <!-- News/Engine Updates -->
      <div class="sec-head">
        <span class="sec-title">${activeEngine === 'java' ? 'Java Updates & Settings' : 'Bedrock Updates & News'}</span>
      </div>
      <div class="news-item stagger">
        <div class="news-card">
          <div class="news-body">
            <div class="news-title">${activeEngine === 'java' ? 'Paper & Purpur JAR Downloader' : 'Bedrock Dedicated Server'}</div>
            <div class="news-sub">${activeEngine === 'java' ? 'JVM tuning presets ready in Settings.' : 'Add-on behavior integration active.'}</div>
          </div>
        </div>
        <div class="news-card">
          <div class="news-body">
            <div class="news-title">TrLaucher Official Release</div>
            <div class="news-sub">The next-generation Bedrock & Java launcher.</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;

  // Particles
  const hero = container.querySelector('#home-hero');
  if (cleanupFn) cleanupFn();
  cleanupFn = initParticles(hero);

  // Toggle buttons
  container.querySelectorAll('.engine-btn-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const selectedEngine = btn.dataset.engine;
      await Storage.set('active_engine', selectedEngine);
      Toast.success('Chế độ chơi đã thay đổi', `Đã kích hoạt Minecraft ${selectedEngine === 'java' ? 'Java Edition' : 'Bedrock PE'}`);
      renderHome(container, account, navigate);
    });
  });

  // Play / Install button
  const playBtn = container.querySelector('#btn-play');
  const installBtn = container.querySelector('#btn-install-mc');

  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      playBtn.disabled = true;
      playBtn.querySelector('.play-btn-sub').textContent = 'Đang mở Minecraft...';

      if (activeEngine === 'java') {
        if (window.electronAPI) {
          const result = await MinecraftLauncher.launch();
          if (result.success) {
            Toast.success('Đã khởi động', 'Minecraft Java Launcher đang mở...');
          } else {
            Toast.error('Không thể mở', result.message || 'Chưa cài Java Launcher (Prism/MultiMC/Official)');
          }
        } else {
          // Java launching simulation
          await new Promise(r => setTimeout(r, 1200));
          Toast.success('Đã khởi động Java', 'Mở Minecraft Java thành công (Mô phỏng)!');
        }
      } else {
        const result = await MinecraftLauncher.launch();
        if (result.success) {
          Toast.success('Đã khởi động', `Minecraft Bedrock ${activeVer.name} đang mở...`);
        } else if (result.reason === 'not_installed') {
          Toast.error('Chưa cài Minecraft', 'Vui lòng cài Minecraft PE từ Play Store');
          await MinecraftLauncher.openPlayStore();
        } else if (result.reason === 'browser') {
          Toast.info('Chạy trên trình duyệt', 'Cài APK lên Android để launch Minecraft thật');
        } else {
          Toast.error('Không thể mở', result.message || 'Lỗi không xác định');
        }
      }
      playBtn.disabled = false;
      playBtn.querySelector('.play-btn-sub').textContent = displayVer;
    });
  }

  if (installBtn) {
    installBtn.addEventListener('click', () => MinecraftLauncher.openPlayStore());
  }

  // Navigation clicks
  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });

  container.querySelector('#btn-goto-profile')?.addEventListener('click', () => navigate('profile'));
}
