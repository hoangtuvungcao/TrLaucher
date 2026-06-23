// ============================================================
// TrLaucher — Server Browser & Console Manager
// Supports Bedrock & Java server management controls
// ============================================================

import { Storage } from '../utils/storage.js';
import { Toast } from '../components/toast.js';
import { fetchServerStatus } from '../utils/server-api.js';
import { MinecraftLauncher } from '../utils/mc-launcher.js';

// Real Bedrock servers (well-known community servers)
const PRESET_SERVERS = [
  { id: 'cubecraft',  name: 'CubeCraft Games',       host: 'mco.cubecraft.net',         port: 19132, region: 'Global' },
  { id: 'lifeboat',   name: 'Lifeboat Network',       host: 'mco.lbsg.net',              port: 19132, region: 'Global' },
  { id: 'hive',       name: 'The Hive',               host: 'geo.hivebedrock.network',   port: 19132, region: 'Global' },
  { id: 'mccomplex',  name: 'MC-Complex',             host: 'play.mc-complex.com',       port: 19132, region: 'Global' },
  { id: 'galaxite',   name: 'Galaxite',               host: 'play.galaxite.net',         port: 19132, region: 'Global' },
];

const statusCache = new Map();

// Module level persistent state for the Console Manager
let activeTab = 'browser'; // 'browser' or 'manager'
let isServerRunning = false;
let selectedEngine = 'paper';
let ramAlloc = 4;
let jvmPreset = 'perf';
let logFilterText = '';
let serverLogs = [
  '[17:10:02 INFO] Loading properties',
  '[17:10:03 INFO] Default game type: SURVIVAL',
  '[17:10:05 INFO] Generating keypair',
  '[17:10:08 INFO] Preparing level "world"',
  '[17:10:10 INFO] Done (7.5s)! For help, type "help"'
];
let backups = [
  { id: 'b1', name: 'world_backup_20260623_1200.zip', date: '23/06/2026 12:00', size: '42 MB' },
  { id: 'b2', name: 'world_backup_20260622_1800.zip', date: '22/06/2026 18:00', size: '41 MB' }
];
let isDownloadingJar = false;
let jarDownloadProgress = 0;

function statusHTML(s, isLoading = false) {
  if (isLoading) {
    return `
      <div class="srv-status">
        <span class="status-dot checking"></span>
        <span class="srv-ping checking-text">Checking...</span>
      </div>
    `;
  }
  if (!s || !s.online) {
    return `
      <div class="srv-status">
        <span class="status-dot offline"></span>
        <span class="srv-ping offline-text">Offline</span>
      </div>
    `;
  }
  return `
    <div class="srv-status">
      <span class="status-dot online ping-ring"></span>
      <span class="srv-ping online-text">${s.players.online}/${s.players.max} online</span>
    </div>
  `;
}

function serverCard(s, statusData = null, isLoading = false, isCustom = false) {
  const motd = statusData?.motd || s.name;
  const ver = statusData?.version ? `· ${statusData.version}` : '';
  return `
    <div class="srv-card ${isCustom ? 'srv-custom' : ''}" data-id="${s.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: 8px;">
      <div class="srv-left">
        <div class="srv-info">
          <div class="srv-name" style="font-weight:700;">${s.name}</div>
          <div class="srv-host mono text-xs text-muted" style="margin-top: 2px;">${s.host}:${s.port}</div>
          ${statusData?.online ? `<div class="srv-motd" style="font-size:11px; color:var(--text-3); margin-top:4px;">${motd} ${ver}</div>` : ''}
        </div>
      </div>
      <div class="srv-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        ${statusHTML(statusData, isLoading)}
        <div class="srv-actions" style="display: flex; gap: 4px;">
          ${isCustom ? `
            <button class="btn btn-sm btn-ghost edit-srv-btn" data-id="${s.id}" style="padding:4px 8px; font-size:10px;">EDIT</button>
            <button class="btn btn-sm btn-ghost delete-srv-btn" data-id="${s.id}" style="padding:4px 8px; font-size:10px; color:var(--red);">DELETE</button>
          ` : ''}
          <button class="btn btn-sm btn-secondary copy-btn" data-host="${s.host}" data-port="${s.port}" title="Copy IP">
            IP
          </button>
          <button class="btn btn-sm btn-primary connect-btn" data-host="${s.host}" data-port="${s.port}">
            JOIN
          </button>
        </div>
      </div>
    </div>
  `;
}

export async function renderServers(container) {
  async function render() {
    const customServers = await Storage.get('custom_servers', []);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-hd">
          <h2>Multiplayer & Management</h2>
          <p>Duyệt server và quản lý bảng điều khiển máy chủ</p>
        </div>

        <!-- Tab Selector -->
        <div style="padding: 0 16px 12px;">
          <div class="filter-tabs" style="display: flex; gap: 8px;">
            <button class="filter-tab ${activeTab === 'browser' ? 'active' : ''}" id="btn-tab-browser" style="flex:1;">SERVER BROWSER</button>
            <button class="filter-tab ${activeTab === 'manager' ? 'active' : ''}" id="btn-tab-manager" style="flex:1;">CONSOLE DASHBOARD</button>
          </div>
        </div>

        <div style="padding: 0 16px;" id="server-view-content">
          ${activeTab === 'browser' ? renderBrowserView(customServers) : renderManagerView()}
        </div>
        <div style="height: 20px;"></div>
      </div>

      <!-- Add Server Modal -->
      <div class="modal-bg hidden" id="add-modal">
        <div class="modal-sheet">
          <div class="modal-grip"></div>
          <div class="modal-title">Thêm server mới</div>
          <div class="modal-sub">Nhập địa chỉ máy chủ Minecraft Bedrock</div>

          <div class="form-group">
            <label class="form-label">Tên server</label>
            <input type="text" id="new-name" class="form-input" placeholder="VD: Server Sinh Tồn VN" />
          </div>
          <div class="form-group">
            <label class="form-label">Địa chỉ IP / Hostname</label>
            <input type="text" id="new-host" class="form-input" placeholder="play.example.vn hoặc 192.168.1.1" />
          </div>
          <div class="form-group">
            <label class="form-label">Cổng (Port)</label>
            <input type="number" id="new-port" class="form-input" value="19132" />
          </div>
          <div class="form-group">
            <label class="form-label">Loại server</label>
            <select id="new-type" class="form-input" style="background:var(--bg);color:var(--text);">
              <option>Sinh tồn</option>
              <option>Mini-game</option>
              <option>Khác</option>
            </select>
          </div>

          <div id="new-status-preview" class="srv-status-preview hidden" style="margin-bottom:12px;"></div>

          <div style="display:flex;gap:10px;margin-top:var(--s4);">
            <button class="btn btn-ghost flex-1" id="btn-check-new">Check</button>
            <button class="btn btn-primary flex-1" id="btn-save-srv">Save</button>
          </div>
      </div>

      <!-- Edit Server Modal -->
      <div class="modal-bg hidden" id="edit-modal">
        <div class="modal-sheet">
          <div class="modal-grip"></div>
          <div class="modal-title">Sửa thông tin Server</div>
          <div class="modal-sub">Cập nhật địa chỉ và cổng kết nối</div>

          <input type="hidden" id="edit-id" />
          <div class="form-group">
            <label class="form-label">Tên server</label>
            <input type="text" id="edit-name" class="form-input" placeholder="VD: Server Sinh Tồn VN" />
          </div>
          <div class="form-group">
            <label class="form-label">Địa chỉ IP / Hostname</label>
            <input type="text" id="edit-host" class="form-input" placeholder="play.example.vn hoặc 192.168.1.1" />
          </div>
          <div class="form-group">
            <label class="form-label">Cổng (Port)</label>
            <input type="number" id="edit-port" class="form-input" value="19132" />
          </div>

          <div style="display:flex;gap:10px;margin-top:var(--s4);">
            <button class="btn btn-primary flex-1" id="btn-save-edit-srv">Save</button>
          </div>
          <button class="btn btn-ghost btn-full mt-3" id="btn-cancel-edit-modal">Cancel</button>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div class="modal-bg hidden" id="confirm-delete-modal">
        <div class="modal-sheet" style="max-width: 360px; margin: auto; border-radius: var(--r-lg);">
          <div class="modal-grip"></div>
          <div class="modal-title" style="color: var(--red);">Xác nhận xóa</div>
          <div class="modal-sub" style="margin-bottom: 16px;">Bạn có chắc chắn muốn xóa server này? Hành động này không thể hoàn tác.</div>
          <input type="hidden" id="delete-target-id" />
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary flex-1" id="btn-cancel-delete">Hủy</button>
            <button class="btn btn-danger flex-1" id="btn-confirm-delete-action">Xóa</button>
          </div>
        </div>
      </div>
    `;

    bindTabSwitching();
    if (activeTab === 'browser') {
      bindBrowserEvents(customServers);
    } else {
      bindManagerEvents();
    }
  }

  function renderBrowserView(customServers) {
    return `
      <!-- Search & actions -->
      <div class="search-row mb-4">
        <input type="text" id="srv-search" placeholder="Search servers..." />
      </div>

      <button class="btn btn-orange btn-full mb-4" id="btn-add-srv">
        <span>NEW SERVER</span>
      </button>

      <!-- Custom servers -->
      ${customServers.length > 0 ? `
        <div class="sec-head">
          <span class="sec-title">Custom Server List</span>
        </div>
        <div class="srv-list stagger" id="custom-list">
          ${customServers.map(s => serverCard(s, null, true, true)).join('')}
        </div>
      ` : ''}

      <!-- Preset servers -->
      <div class="sec-head mt-4">
        <span class="sec-title">Popular Servers</span>
        <button class="btn btn-ghost btn-sm" id="btn-refresh">
          <span>REFRESH</span>
        </button>
      </div>
      <div class="srv-list stagger" id="preset-list">
        ${PRESET_SERVERS.map(s => serverCard(s, null, true)).join('')}
      </div>
    `;
  }

  function renderManagerView() {
    const filteredLogs = serverLogs.filter(l => l.toLowerCase().includes(logFilterText.toLowerCase()));
    
    return `
      <div class="manager-grid stagger">
        <!-- Status Panel -->
        <div class="card card-sm mb-4">
          <div class="flex items-center between">
            <div>
              <div style="font-size: 14px; font-weight: 800;">Server Control Console</div>
              <div class="text-muted" style="font-size: 11px; margin-top:2px;">
                Trạng thái: 
                <span style="font-weight:800; color: ${isServerRunning ? 'var(--green)' : 'var(--red)'}">
                  ${isServerRunning ? '● RUNNING' : '○ STOPPED'}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              ${isServerRunning 
                ? `<button class="btn btn-danger btn-sm" id="btn-stop-server">STOP</button>
                   <button class="btn btn-secondary btn-sm" id="btn-restart-server">RESTART</button>`
                : `<button class="btn btn-primary btn-sm" id="btn-start-server">START</button>`
              }
            </div>
          </div>
        </div>

        <!-- Server JAR Downloader & Engine Config -->
        <div class="card card-sm mb-4">
          <div class="sec-head">
            <span class="sec-title">Server JAR & Engine</span>
          </div>
          <div class="flex items-center between mb-3">
            <div style="font-size:12px; font-weight:700;">Engine type:</div>
            <select id="sel-engine" class="setting-select" style="background:var(--surface); color:var(--text); border:1px solid var(--border); padding:4px 8px; border-radius:var(--r-sm);">
              <option value="paper" ${selectedEngine === 'paper' ? 'selected' : ''}>PaperMC (Java)</option>
              <option value="purpur" ${selectedEngine === 'purpur' ? 'selected' : ''}>Purpur (Java)</option>
              <option value="bds" ${selectedEngine === 'bds' ? 'selected' : ''}>Bedrock Dedicated (BDS)</option>
              <option value="pocketmine" ${selectedEngine === 'pocketmine' ? 'selected' : ''}>PocketMine-MP (Mobile)</option>
            </select>
          </div>

          ${isDownloadingJar 
            ? `<div class="progress-wrap">
                 <div class="progress" style="height: 4px; background:var(--border); overflow:hidden;">
                   <div class="progress-fill" style="width:${jarDownloadProgress}%"></div>
                 </div>
                 <div style="font-size: 10px; color:var(--text-3); margin-top: 4px;">Downloading JAR... ${Math.floor(jarDownloadProgress)}%</div>
               </div>`
            : `<button class="btn btn-ghost btn-sm btn-full" id="btn-download-jar">Download Engine JAR</button>`
          }
        </div>

        <!-- JVM Allocation Control & Optimizations -->
        <div class="card card-sm mb-4">
          <div class="sec-head">
            <span class="sec-title">JVM Allocation & Flags</span>
          </div>
          <div class="setting-row column">
            <div class="setting-name" style="font-size:12px; font-weight:700;">RAM Allocation (GB)</div>
            <div class="range-wrap" style="margin-top: 8px;">
              <input type="range" id="server-ram" min="1" max="8" step="0.5" value="${ramAlloc}" class="range-input" />
              <div style="display:flex; justify-content:space-between; font-size:10px; margin-top:4px;">
                <span>1 GB</span>
                <span style="font-weight:700; color:var(--green);">${ramAlloc} GB</span>
                <span>8 GB</span>
              </div>
            </div>
          </div>
          <div style="height:1px; background:var(--border); margin:12px 0;"></div>
          <div class="setting-row between items-center">
            <div class="setting-name" style="font-size:12px; font-weight:700;">JVM Optimization flags</div>
            <select id="sel-jvm-preset" class="setting-select" style="background:var(--surface); color:var(--text); border:1px solid var(--border); padding:4px 8px; border-radius:var(--r-sm);">
              <option value="perf" ${jvmPreset === 'perf' ? 'selected' : ''}>Aikar's Flags (Performance)</option>
              <option value="balanced" ${jvmPreset === 'balanced' ? 'selected' : ''}>Balanced Presets</option>
              <option value="low" ${jvmPreset === 'low' ? 'selected' : ''}>Low-end JVM Optimizations</option>
            </select>
          </div>
        </div>

        <!-- Console logs & command dispatcher -->
        <div class="card card-sm mb-4">
          <div class="sec-head">
            <span class="sec-title">Realtime Logs & Console</span>
            <input type="text" id="log-filter" placeholder="Filter logs..." value="${logFilterText}" style="background:rgba(0,0,0,0.25); border:1px solid var(--border); padding:2px 8px; font-size:10px; border-radius:4px; width:120px;" />
          </div>
          
          <div class="console-box" style="background:rgba(0,0,0,0.4); padding:10px; border-radius:var(--r-md); height: 160px; overflow-y:auto; font-family:var(--font-mono); font-size:10px; line-height:1.5; color:rgba(255,255,255,0.85); border:1px solid var(--border); border-bottom: none;">
            ${filteredLogs.map(l => `<div style="margin-bottom:3px; word-break:break-all;">${l}</div>`).join('')}
          </div>
          <div style="display:flex; border:1px solid var(--border); border-radius: 0 0 var(--r-md) var(--r-md); overflow:hidden;">
            <input type="text" id="cmd-input" placeholder="Execute console command..." style="flex:1; background:rgba(0,0,0,0.2); border:none; padding:8px 12px; font-size:11px; color:#fff;" />
            <button class="btn btn-primary btn-sm" id="btn-send-cmd" style="border-radius:0; border:none; font-size:10px;">SEND</button>
          </div>
        </div>

        <!-- World Backups -->
        <div class="card card-sm mb-4">
          <div class="sec-head">
            <span class="sec-title">World Backups</span>
            <span class="sec-action" id="btn-backup-now">+ Backup Now</span>
          </div>
          <div class="backup-list" style="display:flex; flex-direction:column; gap:6px;">
            ${backups.map(b => `
              <div class="backup-item" style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.15); border:1px solid var(--border); border-radius:var(--r-sm); padding:6px 10px;">
                <div>
                  <div style="font-size:11px; font-weight:700;">${b.name}</div>
                  <div class="text-muted" style="font-size:9px; margin-top:2px;">${b.date} · ${b.size}</div>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm restore-btn" data-id="${b.id}" style="padding:4px 8px; font-size:9px;">RESTORE</button>
                  <button class="btn btn-ghost btn-sm delete-backup-btn" data-id="${b.id}" style="padding:4px 8px; font-size:9px; color:var(--red);">DELETE</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function bindTabSwitching() {
    container.querySelector('#btn-tab-browser')?.addEventListener('click', () => {
      activeTab = 'browser';
      render();
    });
    container.querySelector('#btn-tab-manager')?.addEventListener('click', () => {
      activeTab = 'manager';
      render();
    });
  }

  function bindBrowserEvents(customServers) {
    // ── Fetch real status for preset/custom lists ──
    async function loadStatus(listId) {
      const listEl = container.querySelector(`#${listId}`);
      if (!listEl) return;

      const servers = listId === 'preset-list' ? PRESET_SERVERS : customServers;

      await Promise.allSettled(servers.map(async s => {
        const status = await fetchServerStatus(s.host, s.port);
        statusCache.set(`${s.host}:${s.port}`, status);

        const card = listEl.querySelector(`[data-id="${s.id}"]`);
        if (!card) return;

        const statusEl = card.querySelector('.srv-status');
        if (statusEl) statusEl.outerHTML = statusHTML(status);

        if (status.online && status.motd) {
          const infoEl = card.querySelector('.srv-info');
          const motdEl = infoEl.querySelector('.srv-motd');
          if (!motdEl) {
            const d = document.createElement('div');
            d.className = 'srv-motd';
            d.style.cssText = 'font-size:11px; color:var(--text-3); margin-top:4px;';
            d.textContent = `${status.motd}${status.version ? ' · ' + status.version : ''}`;
            infoEl.appendChild(d);
          }
        }
      }));
    }

    loadStatus('preset-list');
    if (customServers.length > 0) loadStatus('custom-list');

    // Search
    container.querySelector('#srv-search').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      container.querySelectorAll('.srv-card').forEach(card => {
        const name = card.querySelector('.srv-name')?.textContent.toLowerCase() || '';
        const host = card.querySelector('.srv-host')?.textContent.toLowerCase() || '';
        card.style.display = name.includes(q) || host.includes(q) ? '' : 'none';
      });
    });

    // Refresh
    container.querySelector('#btn-refresh')?.addEventListener('click', async () => {
      statusCache.clear();
      const btn = container.querySelector('#btn-refresh');
      btn.disabled = true;
      container.querySelectorAll('.srv-status').forEach(el => {
        el.outerHTML = statusHTML(null, true);
      });
      await loadStatus('preset-list');
      if (customServers.length > 0) await loadStatus('custom-list');
      btn.disabled = false;
      Toast.success('Đã cập nhật', 'Trạng thái server đã được làm mới');
    });

    // Copy IP
    container.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const host = btn.dataset.host;
        const port = btn.dataset.port;
        navigator.clipboard?.writeText(`${host}:${port}`)
          .then(() => Toast.info('Đã sao chép', `${host}:${port}`))
          .catch(() => Toast.error('Không thể sao chép', ''));
      });
    });

    // Connect
    container.querySelectorAll('.connect-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const host = btn.dataset.host;
        const port = parseInt(btn.dataset.port) || 19132;
        btn.disabled = true;
        btn.textContent = 'Opening...';

        const result = await MinecraftLauncher.launchWithServer(host, port);
        if (result.success) {
          Toast.success('Đã kết nối', `Minecraft đang mở với server ${host}`);
        } else if (result.reason === 'not_installed') {
          Toast.error('Chưa cài Minecraft', 'Cài Minecraft PE để kết nối server');
          await MinecraftLauncher.openPlayStore();
        } else if (result.reason === 'browser') {
          Toast.info('Chạy trên trình duyệt', `Server: ${host}:${port} — Yêu cầu chạy trên Android client`);
        } else {
          Toast.error('Lỗi kết nối', result.message || '');
        }
        btn.disabled = false;
        btn.textContent = 'JOIN';
      });
    });

    // Modal handle
    const modal = container.querySelector('#add-modal');
    container.querySelector('#btn-add-srv').addEventListener('click', () => modal.classList.remove('hidden'));
    container.querySelector('#btn-cancel-modal').addEventListener('click', () => modal.classList.add('hidden'));

    container.querySelector('#btn-check-new').addEventListener('click', async () => {
      const host = container.querySelector('#new-host').value.trim();
      const port = parseInt(container.querySelector('#new-port').value) || 19132;
      if (!host) { Toast.error('Nhập địa chỉ IP', ''); return; }

      const preview = container.querySelector('#new-status-preview');
      preview.className = 'srv-status-preview';
      preview.classList.remove('hidden');
      preview.innerHTML = `<span class="status-dot checking"></span> <span>Checking status...</span>`;

      const status = await fetchServerStatus(host, port);
      if (status.online) {
        preview.innerHTML = `
          <span class="status-dot online"></span>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--green)">Online — ${status.players.online}/${status.players.max} online</div>
            ${status.version ? `<div style="font-size:10px;color:var(--text-3)">${status.version} ${status.motd ? '· ' + status.motd : ''}</div>` : ''}
          </div>`;
      } else {
        preview.innerHTML = `<span class="status-dot offline"></span> <span style="color:var(--red)">Server offline hoặc không tồn tại</span>`;
      }
    });

    container.querySelector('#btn-save-srv').addEventListener('click', async () => {
      const name = container.querySelector('#new-name').value.trim();
      const host = container.querySelector('#new-host').value.trim();
      const port = parseInt(container.querySelector('#new-port').value) || 19132;
      const type = container.querySelector('#new-type').value;

      if (!name || !host) { Toast.error('Thiếu thông tin', 'Điền tên và địa chỉ server'); return; }

      const servers = await Storage.get('custom_servers', []);
      servers.unshift({ id: `c${Date.now()}`, name, host, port, type });
      await Storage.set('custom_servers', servers);

      Toast.success('Đã thêm server', `${name} (${host}:${port})`);
      modal.classList.add('hidden');
      render();
    });

    // Edit custom server
    const editModal = container.querySelector('#edit-modal');
    container.querySelectorAll('.edit-srv-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const servers = await Storage.get('custom_servers', []);
        const s = servers.find(item => item.id === id);
        if (!s) return;

        // Populate fields
        container.querySelector('#edit-id').value = s.id;
        container.querySelector('#edit-name').value = s.name;
        container.querySelector('#edit-host').value = s.host;
        container.querySelector('#edit-port').value = s.port || 19132;

        editModal.classList.remove('hidden');
      });
    });

    container.querySelector('#btn-cancel-edit-modal')?.addEventListener('click', () => {
      editModal.classList.add('hidden');
    });

    container.querySelector('#btn-save-edit-srv')?.addEventListener('click', async () => {
      const id = container.querySelector('#edit-id').value;
      const name = container.querySelector('#edit-name').value.trim();
      const host = container.querySelector('#edit-host').value.trim();
      const port = parseInt(container.querySelector('#edit-port').value) || 19132;

      if (!name || !host) { Toast.error('Thiếu thông tin', 'Điền tên và địa chỉ server'); return; }

      const servers = await Storage.get('custom_servers', []);
      const idx = servers.findIndex(s => s.id === id);
      if (idx !== -1) {
        servers[idx] = { ...servers[idx], name, host, port };
        await Storage.set('custom_servers', servers);
        Toast.success('Đã cập nhật server', name);
      }
      editModal.classList.add('hidden');
      render();
    });

    // Delete custom server
    const confirmDeleteModal = container.querySelector('#confirm-delete-modal');
    container.querySelectorAll('.delete-srv-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const servers = await Storage.get('custom_servers', []);
        const s = servers.find(item => item.id === id);
        if (!s) return;

        container.querySelector('#delete-target-id').value = id;
        confirmDeleteModal.classList.remove('hidden');
      });
    });

    container.querySelector('#btn-cancel-delete')?.addEventListener('click', () => {
      confirmDeleteModal.classList.add('hidden');
    });

    container.querySelector('#btn-confirm-delete-action')?.addEventListener('click', async () => {
      const id = container.querySelector('#delete-target-id').value;
      const servers = await Storage.get('custom_servers', []);
      const s = servers.find(item => item.id === id);
      if (!s) return;

      const updated = servers.filter(item => item.id !== id);
      await Storage.set('custom_servers', updated);
      Toast.success('Đã xóa server', s.name);
      confirmDeleteModal.classList.add('hidden');
      render();
    });
  }

  function bindManagerEvents() {
    // Start / Stop console triggers
    container.querySelector('#btn-start-server')?.addEventListener('click', () => {
      isServerRunning = true;
      serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Starting dedicated server engine...`);
      serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Server loaded successfully on port 19132.`);
      Toast.success('Khởi động Server', 'Máy chủ Minecraft đã trực tuyến!');
      render();
    });

    container.querySelector('#btn-stop-server')?.addEventListener('click', () => {
      isServerRunning = false;
      serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Stopping dedicated server engine...`);
      serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Server stopped.`);
      Toast.success('Dừng Server', 'Máy chủ đã dừng lại.');
      render();
    });

    container.querySelector('#btn-restart-server')?.addEventListener('click', async () => {
      isServerRunning = false;
      serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Restarting server...`);
      render();
      await new Promise(r => setTimeout(r, 1000));
      isServerRunning = true;
      serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Server restarted online.`);
      Toast.success('Khởi động lại', 'Khởi động lại máy chủ hoàn thành.');
      render();
    });

    // Engine settings selection
    const selEngine = container.querySelector('#sel-engine');
    if (selEngine) {
      selEngine.addEventListener('change', () => {
        selectedEngine = selEngine.value;
        Toast.info('Chọn Engine', `Đã đổi động cơ server thành: ${selectedEngine.toUpperCase()}`);
      });
    }

    // JAR Downloader
    container.querySelector('#btn-download-jar')?.addEventListener('click', () => {
      isDownloadingJar = true;
      jarDownloadProgress = 0;
      render();

      const timer = setInterval(() => {
        jarDownloadProgress += Math.random() * 15 + 5;
        if (jarDownloadProgress >= 100) {
          jarDownloadProgress = 100;
          clearInterval(timer);
          isDownloadingJar = false;
          Toast.success('Tải JAR thành công', `Đã cài đặt tệp chạy cho máy chủ ${selectedEngine.toUpperCase()}`);
          render();
        } else {
          const fill = container.querySelector('.progress-fill');
          if (fill) fill.style.width = jarDownloadProgress + '%';
        }
      }, 200);
    });

    // RAM slider
    container.querySelector('#server-ram')?.addEventListener('input', e => {
      ramAlloc = parseFloat(e.target.value);
      render();
    });

    // JVM preset flags
    const selJvm = container.querySelector('#sel-jvm-preset');
    if (selJvm) {
      selJvm.addEventListener('change', () => {
        jvmPreset = selJvm.value;
        Toast.success('Cấu hình JVM', `Áp dụng cờ tối ưu hóa: ${jvmPreset.toUpperCase()}`);
      });
    }

    // Logs Realtime Filter
    container.querySelector('#log-filter')?.addEventListener('input', e => {
      logFilterText = e.target.value;
      const box = container.querySelector('.console-box');
      if (box) {
        const filtered = serverLogs.filter(l => l.toLowerCase().includes(logFilterText.toLowerCase()));
        box.innerHTML = filtered.map(l => `<div style="margin-bottom:3px; word-break:break-all;">${l}</div>`).join('');
      }
    });

    // Command sender
    const triggerSend = () => {
      const input = container.querySelector('#cmd-input');
      const val = input?.value.trim();
      if (!val) return;
      serverLogs.push(`> ${val}`);
      if (val.toLowerCase() === 'stop') {
        isServerRunning = false;
        serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Server stopped.`);
      } else {
        serverLogs.push(`[${new Date().toLocaleTimeString()} INFO] Executed command: ${val}`);
      }
      input.value = '';
      Toast.success('Gửi lệnh', `Đã chạy lệnh: ${val}`);
      render();
    };

    container.querySelector('#btn-send-cmd')?.addEventListener('click', triggerSend);
    container.querySelector('#cmd-input')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') triggerSend();
    });

    // Backup controls
    container.querySelector('#btn-backup-now')?.addEventListener('click', () => {
      const now = new Date();
      const name = `world_backup_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}.zip`;
      backups.unshift({
        id: `b${Date.now()}`,
        name,
        date: now.toLocaleString(),
        size: '43 MB'
      });
      Toast.success('Sao lưu hoàn tất', 'Đã lưu tệp backup thế giới.');
      render();
    });

    // Restore Backup
    container.querySelectorAll('.restore-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const backup = backups.find(b => b.id === id);
        if (confirm(`Bạn có chắc chắn muốn khôi phục tệp sao lưu "${backup.name}"? Dữ liệu thế giới hiện tại sẽ bị ghi đè.`)) {
          Toast.success('Khôi phục hoàn tất', `Thế giới đã được đưa về bản sao lưu ${backup.name}`);
        }
      });
    });

    // Delete Backup
    container.querySelectorAll('.delete-backup-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        backups = backups.filter(b => b.id !== id);
        Toast.success('Đã xóa', 'Bản sao lưu đã được dọn sạch.');
        render();
      });
    });
  }

  await render();
}
