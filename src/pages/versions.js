// ============================================================
// TrLaucher — Versions Page
// ============================================================

import { Toast } from '../components/toast.js';
import { Storage } from '../utils/storage.js';

export const VERSIONS = [
  { id: 'v1.21.80', name: '1.21.80',  type: 'Release', date: 'Tháng 6, 2025', size: '156 MB', changelog: 'Bản cập nhật Tricky Trials với Vault, Breeze, mace và nhiều hơn nữa.' },
  { id: 'v1.21.70', name: '1.21.70',  type: 'Release', date: 'Tháng 5, 2025', size: '155 MB', changelog: 'Cải tiến độ trễ và sửa lỗi đồng bộ server.' },
  { id: 'v1.21.60', name: '1.21.60',  type: 'Release', date: 'Tháng 4, 2025', size: '154 MB', changelog: 'Sửa lỗi và cải thiện hiệu suất.' },
  { id: 'v1.21.50', name: '1.21.50',  type: 'Release', date: 'Tháng 2, 2025', size: '152 MB', changelog: 'Thêm Happy Ghast, Winter Drop và nhiều nội dung.' },
  { id: 'v1.21.40', name: '1.21.40',  type: 'Release', date: 'Tháng 12, 2024', size: '150 MB', changelog: 'Bundles, Copper Bulb, và nhiều cải tiến.' },
  { id: 'v1.21.30', name: '1.21.30',  type: 'Release', date: 'Tháng 10, 2024', size: '148 MB', changelog: 'Cải tiến UI chat và tối ưu bộ nhớ.' },
  { id: 'v1.21.20', name: '1.21.20',  type: 'Release', date: 'Tháng 9, 2024', size: '147 MB', changelog: 'Cân bằng âm thanh và hiệu năng render.' },
  { id: 'v1.21.0',  name: '1.21.0',   type: 'Release', date: 'Tháng 6, 2024', size: '145 MB', changelog: 'Bản cập nhật lớn Tricky Trials.' },
  { id: 'v1.21.90b','name': '1.21.90 (Beta)', type: 'Beta', date: 'Tháng 6, 2025', size: '158 MB', changelog: 'Preview tính năng mới nhất.' },
  { id: 'v1.20.80', name: '1.20.80',  type: 'Release', date: 'Tháng 9, 2024', size: '145 MB', changelog: 'Bản ổn định cuối cùng của 1.20.' },
  { id: 'v1.20.70', name: '1.20.70',  type: 'Release', date: 'Tháng 8, 2024', size: '143 MB', changelog: 'Cải thiện hiệu suất Geyser proxy.' },
  { id: 'v1.20.60', name: '1.20.60',  type: 'Release', date: 'Tháng 7, 2024', size: '142 MB', changelog: 'Armadillo, Wolf Armor, Vault.' },
  { id: 'v1.20.50', name: '1.20.50',  type: 'Release', date: 'Tháng 5, 2024', size: '140 MB', changelog: 'Cải tiến Wolf Variants.' },
  { id: 'v1.19.83', name: '1.19.83',  type: 'Release', date: 'Tháng 3, 2024', size: '130 MB', changelog: 'Phiên bản cũ, ổn định cao.' },
];

const TYPE_CHIPS = {
  'Release': 'chip-green',
  'Beta':    'chip-orange',
  'Preview': 'chip-blue',
};

// Module-level persistent state for downloads
let downloadingId = null;
let downloadProgress = 0;
let downloadInterval = null;
let activeFilter = 'all';
let onProgressUpdate = null;

export async function renderVersions(container) {
  async function render() {
    const installed = await Storage.get('installed_versions', ['v1.21.80']);
    const activeVersionId = await Storage.get('active_version', 'v1.21.80');

    const filtered = activeFilter === 'all'
      ? VERSIONS
      : VERSIONS.filter(v => v.type.toLowerCase().includes(activeFilter));

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header" style="padding: 20px 16px 8px;">
          <h2 class="page-title">Versions Manager</h2>
          <p class="page-sub">Cài đặt và quản lý các phiên bản Minecraft PE</p>
        </div>

        <!-- Filter tabs -->
        <div style="padding: 0 16px 12px;">
          <div class="filter-tabs" style="display: flex; gap: 8px;">
            <button class="filter-tab ${activeFilter==='all'?'active':''}" data-f="all">Tất Cả</button>
            <button class="filter-tab ${activeFilter==='release'?'active':''}" data-f="release">Release</button>
            <button class="filter-tab ${activeFilter==='beta'?'active':''}" data-f="beta">Beta</button>
          </div>
        </div>

        <!-- Stats -->
        <div style="padding: 0 16px 16px;">
          <div class="version-stats" style="display: flex; justify-content: space-between; background: var(--surface); padding: 12px; border-radius: var(--r-md); border: 1px solid var(--border);">
            <div class="vstat">
              <span class="vstat-val">${installed.length}</span>
              <span class="vstat-label">Đã cài</span>
            </div>
            <div class="vstat">
              <span class="vstat-val">${VERSIONS.length}</span>
              <span class="vstat-label">Có sẵn</span>
            </div>
            <div class="vstat">
              <span class="vstat-val">${installed.reduce((a,_) => a + 150, 0)} MB</span>
              <span class="vstat-label">Dung lượng</span>
            </div>
          </div>
        </div>

        <!-- Version list -->
        <div style="padding: 0 16px;">
          <div class="version-list stagger">
            ${filtered.map(v => {
              const isInstalled = installed.includes(v.id);
              const isActive = v.id === activeVersionId;
              const isDownloading = downloadingId === v.id;
              return `
                <div class="version-card" data-id="${v.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--surface); border: 1px solid ${isActive ? 'var(--green)' : 'var(--border)'}; border-radius: var(--r-md); margin-bottom: 8px; position: relative;">
                  <div class="version-left">
                    <div class="version-info">
                      <div class="version-name" style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
                        Minecraft PE ${v.name}
                        ${isActive ? `<span class="chip chip-green" style="font-size: 8px; padding: 1px 4px;">ACTIVE</span>` : ''}
                      </div>
                      <div class="version-meta" style="margin-top: 4px;">
                        <span class="chip ${TYPE_CHIPS[v.type] || 'chip-muted'}">${v.type.toUpperCase()}</span>
                        <span class="text-muted" style="font-size:11px; margin-left: 6px;">${v.date} · ${v.size}</span>
                      </div>
                    </div>
                  </div>
                  <div class="version-actions" style="display: flex; gap: 6px;">
                    ${isInstalled
                      ? isActive
                        ? `<button class="btn btn-primary btn-sm launch-btn" data-id="${v.id}">LAUNCH</button>`
                        : `<button class="btn btn-secondary btn-sm select-btn" data-id="${v.id}">SELECT</button>
                           <button class="btn btn-ghost btn-sm delete-btn" data-id="${v.id}" style="color: var(--red);">REMOVE</button>`
                      : isDownloading
                        ? `<button class="btn btn-ghost btn-sm" disabled>DOWNLOADING</button>`
                        : `<button class="btn btn-outline btn-sm download-btn" data-id="${v.id}">GET</button>`
                    }
                  </div>
                </div>
                ${isDownloading ? `
                  <div class="version-progress" id="progress-${v.id}" style="padding: 0 var(--s2) var(--s3); margin-top: -6px; margin-bottom: 12px;">
                    <div class="progress" style="height: 4px; background: var(--border); border-radius: 99px; overflow: hidden;">
                      <div class="progress-fill" style="width:${downloadProgress}%" id="fill-${v.id}"></div>
                    </div>
                    <div class="progress-label" id="label-${v.id}" style="font-size: 10px; color: var(--text-3); margin-top: 4px;">Đang tải... ${Math.floor(downloadProgress)}%</div>
                  </div>` : ''}
              `;
            }).join('')}
          </div>
        </div>
        <div style="height: 20px;"></div>
      </div>
    `;

    // Filter tabs
    container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeFilter = tab.dataset.f;
        render();
      });
    });

    // Download buttons
    container.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const version = VERSIONS.find(v => v.id === id);
        downloadingId = id;
        downloadProgress = 0;
        await render();

        if (downloadInterval) clearInterval(downloadInterval);
        downloadInterval = setInterval(async () => {
          downloadProgress += Math.random() * 8 + 3;
          if (downloadProgress >= 100) {
            downloadProgress = 100;
            clearInterval(downloadInterval);
            downloadInterval = null;

            const inst = await Storage.get('installed_versions', ['v1.21.80']);
            if (!inst.includes(id)) {
              inst.push(id);
              await Storage.set('installed_versions', inst);
            }
            downloadingId = null;
            downloadProgress = 0;
            Toast.success('Tải xong!', `Minecraft PE ${version.name} đã sẵn sàng`);
            render();
            return;
          }
          if (onProgressUpdate) onProgressUpdate();
        }, 180);
      });
    });

    // Select buttons
    container.querySelectorAll('.select-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const version = VERSIONS.find(v => v.id === id);
        await Storage.set('active_version', id);
        Toast.success('Đã chọn phiên bản', `Minecraft PE ${version.name} hiện là phiên bản hoạt động`);
        await render();
      });
    });

    // Launch buttons
    container.querySelectorAll('.launch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const version = VERSIONS.find(v => v.id === id);
        Toast.info('🚀 Đang khởi động...', `Minecraft PE ${version?.name}`, 3000);
      });
    });

    // Delete buttons
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const activeVersionId = await Storage.get('active_version', 'v1.21.80');
        if (id === activeVersionId) {
          Toast.warn('Không thể xoá', 'Đây là phiên bản đang hoạt động');
          return;
        }
        let inst = await Storage.get('installed_versions', ['v1.21.80']);
        inst = inst.filter(i => i !== id);
        await Storage.set('installed_versions', inst);
        Toast.success('Đã xoá', 'Phiên bản đã được xoá khỏi thiết bị');
        await render();
      });
    });

    // Bind real-time progress update callback
    onProgressUpdate = () => {
      if (!downloadingId) return;
      const fill = container.querySelector(`#fill-${downloadingId}`);
      const label = container.querySelector(`#label-${downloadingId}`);
      if (fill) { fill.style.width = downloadProgress + '%'; }
      if (label) { label.textContent = `Đang tải... ${Math.floor(downloadProgress)}%`; }
    };
  }

  await render();
}
