// ============================================================
// TrLaucher — Settings Page
// ============================================================

import { Storage } from '../utils/storage.js';
import { Toast } from '../components/toast.js';
import { applyAppSettings } from '../utils/settings-helper.js';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  accentColor: 'green',
  language: 'vi',
  ramAlloc: 2,
  fpsLimit: 60,
  renderDist: 12,
  touchSensitivity: 50,
  masterVolume: 100,
  musicVolume: 70,
  sfxVolume: 80,
  autoUpdate: true,
  showFps: false,
  reducedMotion: false,
};

export async function renderSettings(container) {
  let settings = { ...DEFAULT_SETTINGS, ...await Storage.get('settings', {}) };
  let activeTab = 'display';

  const TABS = [
    { id: 'display',    label: 'DISPLAY' },
    { id: 'perf',       label: 'PERFORMANCE' },
    { id: 'controls',   label: 'CONTROLS' },
    { id: 'audio',      label: 'AUDIO' },
    { id: 'about',      label: 'SYSTEM' },
  ];

  async function saveSettings(updates) {
    settings = { ...settings, ...updates };
    await Storage.set('settings', settings);
    applyAppSettings(settings);
  }

  function renderTabContent() {
    if (activeTab === 'display') return `
      <div class="settings-group stagger">
        <div class="settings-section-title">THEME & LOOK</div>
        <div class="card card-sm">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Chủ đề</div>
              <div class="setting-desc">Chế độ sáng/tối</div>
            </div>
            <div class="theme-switch" style="display: flex; gap: 4px;">
              <button class="theme-btn ${settings.theme==='dark'?'active':''}" data-theme="dark" style="padding: 6px 12px; border-radius: var(--r-sm); font-size: 11px; font-weight: 700;">DARK</button>
              <button class="theme-btn ${settings.theme==='light'?'active':''}" data-theme="light" style="padding: 6px 12px; border-radius: var(--r-sm); font-size: 11px; font-weight: 700;">LIGHT</button>
              <button class="theme-btn ${settings.theme==='oled'?'active':''}" data-theme="oled" style="padding: 6px 12px; border-radius: var(--r-sm); font-size: 11px; font-weight: 700;">OLED</button>
            </div>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Màu nhấn</div>
              <div class="setting-desc">Màu chủ đạo của ứng dụng</div>
            </div>
            <div class="accent-pills" style="display: flex; gap: 8px;">
              ${[
                { id:'green',  color:'#10B981' },
                { id:'blue',   color:'#3B82F6' },
                { id:'purple', color:'#8B5CF6' },
                { id:'orange', color:'#F97316' },
                { id:'red',    color:'#EF4444' },
              ].map(a => `
                <button class="accent-pill ${settings.accentColor===a.id?'active':''}"
                  data-accent="${a.id}" style="background:${a.color}; border: none; width: 18px; height: 18px; border-radius: 99px; cursor: pointer;
                  ${settings.accentColor===a.id?'box-shadow:0 0 8px '+a.color+'; border: 2px solid white;':''}"
                ></button>
              `).join('')}
            </div>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Hiệu ứng chuyển động</div>
              <div class="setting-desc">Animation và hiệu ứng chuyển trang</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-motion" ${!settings.reducedMotion?'checked':''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Ngôn ngữ</div>
              <div class="setting-desc">Ngôn ngữ giao diện</div>
            </div>
            <select class="setting-select" id="sel-language" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); padding: 6px 10px; border-radius: var(--r-sm);">
              <option value="vi" ${settings.language==='vi'?'selected':''}>Tiếng Việt</option>
              <option value="en" ${settings.language==='en'?'selected':''}>English</option>
            </select>
          </div>
        </div>
      </div>
    `;

    if (activeTab === 'perf') return `
      <div class="settings-group stagger">
        <div class="settings-section-title">PERFORMANCE CONFIG</div>
        <div class="card card-sm">
          <div class="setting-row column">
            <div class="setting-info">
              <div class="setting-name">RAM cấp phát</div>
              <div class="setting-desc">RAM dành cho Minecraft (GB)</div>
            </div>
            <div class="range-wrap" style="margin-top: 8px;">
              <input type="range" id="range-ram" min="1" max="8" step="0.5"
                     value="${settings.ramAlloc}" class="range-input" />
              <div class="range-labels" style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
                <span>1 GB</span>
                <span class="range-val" style="font-weight: 700; color: var(--green);">${settings.ramAlloc} GB</span>
                <span>8 GB</span>
              </div>
            </div>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row column">
            <div class="setting-info">
              <div class="setting-name">Giới hạn FPS</div>
              <div class="setting-desc">Số khung hình tối đa mỗi giây</div>
            </div>
            <div class="range-wrap" style="margin-top: 8px;">
              <input type="range" id="range-fps" min="30" max="120" step="10"
                     value="${settings.fpsLimit}" class="range-input" />
              <div class="range-labels" style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
                <span>30</span>
                <span class="range-val" style="font-weight: 700; color: var(--green);">${settings.fpsLimit} FPS</span>
                <span>120</span>
              </div>
            </div>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row column">
            <div class="setting-info">
              <div class="setting-name">Khoảng render</div>
              <div class="setting-desc">Số chunk hiển thị (Render Distance)</div>
            </div>
            <div class="range-wrap" style="margin-top: 8px;">
              <input type="range" id="range-render" min="4" max="32" step="2"
                     value="${settings.renderDist}" class="range-input" />
              <div class="range-labels" style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
                <span>4</span>
                <span class="range-val" style="font-weight: 700; color: var(--green);">${settings.renderDist} chunks</span>
                <span>32</span>
              </div>
            </div>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Hiển thị FPS</div>
              <div class="setting-desc">Góc màn hình hiện tốc độ khung hình</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-fps" ${settings.showFps?'checked':''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;

    if (activeTab === 'controls') return `
      <div class="settings-group stagger">
        <div class="settings-section-title">CONTROL SETTINGS</div>
        <div class="card card-sm">
          <div class="setting-row column">
            <div class="setting-info">
              <div class="setting-name">Độ nhạy cảm ứng</div>
              <div class="setting-desc">Độ nhạy nhìn xung quanh</div>
            </div>
            <div class="range-wrap" style="margin-top: 8px;">
              <input type="range" id="range-touch" min="1" max="100"
                     value="${settings.touchSensitivity}" class="range-input" />
              <div class="range-labels" style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
                <span>LOW</span>
                <span class="range-val" style="font-weight: 700; color: var(--green);">${settings.touchSensitivity}%</span>
                <span>HIGH</span>
              </div>
            </div>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Joystick ảo</div>
              <div class="setting-desc">Hiển thị joystick di chuyển</div>
            </div>
            <label class="toggle">
              <input type="checkbox" checked />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Nút tùy chỉnh</div>
              <div class="setting-desc">Cho phép di chuyển vị trí nút</div>
            </div>
            <label class="toggle">
              <input type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;

    if (activeTab === 'audio') return `
      <div class="settings-group stagger">
        <div class="settings-section-title">AUDIO SETTINGS</div>
        <div class="card card-sm">
          ${[
            { id:'master', label:'Âm lượng chính', desc:'Tất cả âm thanh', key:'masterVolume' },
            { id:'music',  label:'Nhạc nền',       desc:'Nhạc game Minecraft', key:'musicVolume' },
            { id:'sfx',    label:'Hiệu ứng âm thanh', desc:'Tiếng nổ, bước chân...', key:'sfxVolume' },
          ].map((a, i) => `
            ${i > 0 ? '<div class="setting-divider" style="height:1px; background:var(--border); margin:12px 0;"></div>' : ''}
            <div class="setting-row column">
              <div class="setting-info">
                <div class="setting-name">${a.label}</div>
                <div class="setting-desc">${a.desc}</div>
              </div>
              <div class="range-wrap" style="margin-top: 8px;">
                <input type="range" id="range-${a.id}" min="0" max="100"
                       value="${settings[a.key]}" class="range-input" data-key="${a.key}" />
                <div class="range-labels" style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
                  <span>MUTED</span>
                  <span class="range-val" style="font-weight: 700; color: var(--green);">${settings[a.key]}%</span>
                  <span>MAX</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (activeTab === 'about') return `
      <div class="settings-group stagger">
        <div class="about-card" style="text-align: center; padding: 20px 0;">
          <div class="about-name" style="font-size: 24px; font-weight: 800;">TrLauncher</div>
          <div class="about-version" style="font-size: 12px; color: var(--text-3); margin-top: 4px;">VERSION 1.0.0</div>
          <div class="about-desc" style="font-size: 12px; color: var(--text-2); margin-top: 12px; line-height: 1.5;">Launcher Minecraft PE được thiết kế cho cộng đồng Việt Nam. Hỗ trợ quản lý tài khoản tùy biến, skin tùy chọn và kết nối server thứ ba.</div>
        </div>

        <div class="card card-sm mt-3">
          <div class="list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <div class="list-item-body">
              <div class="list-item-title" style="font-weight: 600;">Kiểm tra cập nhật</div>
              <div class="list-item-sub">Phiên bản hiện tại: 1.0.0</div>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-check-update">Kiểm tra</button>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:10px 0;"></div>
          <div class="list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <div class="list-item-body">
              <div class="list-item-title" style="font-weight: 600;">Xóa bộ nhớ cache</div>
              <div class="list-item-sub">Giải phóng không gian lưu trữ</div>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-clear-cache" style="color: var(--red);">Xóa</button>
          </div>
          <div class="setting-divider" style="height:1px; background:var(--border); margin:10px 0;"></div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">Tự động cập nhật</div>
              <div class="setting-desc">Cập nhật launcher tự động</div>
            </div>
            <label class="toggle">
              <input type="checkbox" ${settings.autoUpdate?'checked':''} id="toggle-autoupdate" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div style="text-align:center; margin-top:20px;">
          <div class="text-muted text-sm">Made with by TrLaucher Team</div>
          <div class="text-muted text-xs mt-2">© 2025 TrLaucher · Minecraft PE Launcher</div>
        </div>
      </div>
    `;

    return '';
  }

  function renderPage() {
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header" style="padding: 20px 16px 8px;">
          <h2 class="page-title">Settings & System</h2>
        </div>

        <!-- Settings Tabs -->
        <div class="settings-tabs" style="padding: 0 16px 16px; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;">
          ${TABS.map(t => `
            <button class="settings-tab ${activeTab===t.id?'active':''}" data-tab="${t.id}" style="padding: 8px 12px; border-radius: var(--r-md); background: ${activeTab===t.id?'var(--green-subtle)':'var(--surface)'}; border: 1px solid ${activeTab===t.id?'var(--green)':'var(--border)'}; color: ${activeTab===t.id?'var(--green)':'var(--text-3)'}; font-size: 11px; font-weight: 700; font-family: var(--font); cursor: pointer; white-space: nowrap;">
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>

        <div style="padding: 0 16px;" id="tab-content">
          ${renderTabContent()}
        </div>
        <div style="height: 20px;"></div>
      </div>
    `;

    // Tab switching
    container.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        renderPage();
      });
    });

    bindTabEvents();
  }

  function bindTabEvents() {
    // Theme
    container.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        container.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        await saveSettings({ theme: btn.dataset.theme });
        Toast.info('Chủ đề đã thay đổi', btn.textContent);
      });
    });

    // Accent
    container.querySelectorAll('.accent-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        container.querySelectorAll('.accent-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        await saveSettings({ accentColor: btn.dataset.accent });
        Toast.info('Màu đã thay đổi');
      });
    });

    // Ranges
    container.querySelectorAll('.range-input').forEach(input => {
      input.addEventListener('input', async () => {
        const val = parseFloat(input.value);
        const label = input.nextElementSibling?.querySelector('.range-val');
        if (label) {
          if (input.id === 'range-ram')    label.textContent = `${val} GB`;
          else if (input.id === 'range-fps') label.textContent = `${val} FPS`;
          else if (input.id === 'range-render') label.textContent = `${val} chunks`;
          else if (input.id === 'range-touch') label.textContent = `${val}%`;
          else label.textContent = `${val}%`;
        }

        const key = { 'range-ram':'ramAlloc','range-fps':'fpsLimit','range-render':'renderDist',
          'range-touch':'touchSensitivity','range-master':'masterVolume',
          'range-music':'musicVolume','range-sfx':'sfxVolume' }[input.id];
        if (key) await saveSettings({ [key]: val });
      });
    });

    // Toggles
    ['toggle-motion','toggle-fps','toggle-autoupdate'].forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('change', async () => {
        const keyMap = { 'toggle-motion':'reducedMotion','toggle-fps':'showFps','toggle-autoupdate':'autoUpdate' };
        const isMotion = id === 'toggle-motion';
        await saveSettings({ [keyMap[id]]: isMotion ? !el.checked : el.checked });
      });
    });

    // Language
    const langSel = container.querySelector('#sel-language');
    if (langSel) langSel.addEventListener('change', () => saveSettings({ language: langSel.value }));

    // About buttons
    container.querySelector('#btn-check-update')?.addEventListener('click', () => {
      Toast.info('Bạn đang dùng phiên bản mới nhất!', 'TrLaucher v1.0.0');
    });
    container.querySelector('#btn-clear-cache')?.addEventListener('click', () => {
      Toast.success('Đã xóa cache', 'Đã giải phóng 24 MB');
    });
  }

  renderPage();
}
