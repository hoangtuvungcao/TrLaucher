// ============================================================
// TrLaucher — Mods Page
// ============================================================

import { Toast } from '../components/toast.js';
import { Storage } from '../utils/storage.js';

const FEATURED_MODS = [
  { id:'m1', name:'Furniture Mod', category:'Nội thất', version:'5.2', rating:4.8, downloads:'2.1M', size:'4.2 MB', desc:'Thêm hơn 80 đồ nội thất vào Minecraft PE' },
  { id:'m2', name:'Lucky Block', category:'Gameplay', version:'8.0', rating:4.9, downloads:'5.3M', size:'2.8 MB', desc:'Block may mắn với hàng trăm phần thưởng ngẫu nhiên' },
  { id:'m3', name:'Morph Mod', category:'Nhân vật', version:'3.1', rating:4.7, downloads:'1.8M', size:'6.1 MB', desc:'Biến thành bất kỳ mob nào trong game' },
  { id:'m4', name:'OptiFine PE', category:'Hiệu năng', version:'2.5', rating:4.6, downloads:'3.2M', size:'1.5 MB', desc:'Tối ưu đồ họa, thêm shader và texture HD' },
  { id:'m5', name:'Too Many Items', category:'Inventory', version:'6.0', rating:4.5, downloads:'4.1M', size:'3.4 MB', desc:'Quản lý inventory, tạo vật phẩm dễ dàng' },
  { id:'m6', name:'Dragon Mounts', category:'Sinh vật', version:'2.0', rating:4.8, downloads:'2.9M', size:'8.7 MB', desc:'Thuần hóa và cưỡi rồng với nhiều loại khác nhau' },
];

const CATEGORIES = ['Tất cả', 'Gameplay', 'Sinh vật', 'Nhân vật', 'Hiệu năng', 'Inventory', 'Nội thất', 'Custom'];

export async function renderMods(container) {
  const installed = await Storage.get('installed_mods', []);
  const customMods = await Storage.get('custom_mods', []);
  
  let selectedCat = 'Tất cả';

  function render() {
    const allMods = [...FEATURED_MODS, ...customMods];
    const filtered = selectedCat === 'Tất cả'
      ? allMods
      : allMods.filter(m => m.category === selectedCat);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header" style="padding: 20px 16px 8px;">
          <h2 class="page-title">Mods & Addons</h2>
          <p class="page-sub">Mở rộng trải nghiệm Minecraft PE của bạn</p>
        </div>

        <!-- Search -->
        <div style="padding: 0 16px 12px;">
          <div class="search-bar">
            <input type="text" id="mod-search" placeholder="Search mods..." style="width: 100%; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); color: var(--text);" />
          </div>
        </div>

        <!-- Category chips -->
        <div class="cat-scroll" style="padding: 0 16px 16px; display: flex; gap: 6px; overflow-x: auto;">
          ${CATEGORIES.map(c => `
            <button class="cat-chip ${c===selectedCat?'active':''}" data-cat="${c}" style="padding: 6px 14px; border-radius: 99px; background: ${c===selectedCat?'var(--green-subtle)':'var(--surface)'}; border: 1px solid ${c===selectedCat?'var(--green)':'var(--border)'}; color: ${c===selectedCat?'var(--green)':'var(--text-3)'}; font-family: var(--font); font-weight: 600; cursor: pointer;">${c}</button>
          `).join('')}
        </div>

        <!-- Installed Mods -->
        ${installed.length > 0 ? `
          <div style="padding: 0 16px 16px;">
            <div class="section-header" style="margin-bottom: 8px;">
              <span class="section-title" style="font-weight: 700;">INSTALLED (${installed.length})</span>
            </div>
            <div class="mod-installed-list" style="display: flex; flex-direction: column; gap: 6px;">
              ${allMods.filter(m => installed.includes(m.id)).map(m => `
                <div class="mod-installed-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-sm);">
                  <div style="flex:1; min-width:0;">
                    <div class="mod-installed-name truncate" style="font-weight: 600;">${m.name}</div>
                    <div class="text-muted text-xs">v${m.version || '1.0'}</div>
                  </div>
                  <button class="btn btn-ghost btn-sm uninstall-btn" data-id="${m.id}" style="color: var(--red);">REMOVE</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Featured Mods -->
        <div style="padding: 0 16px;">
          <div class="section-header" style="margin-bottom: 8px;">
            <span class="section-title" style="font-weight: 700;">FEATURED MODS</span>
          </div>
          <div class="mod-grid stagger">
            ${filtered.map(m => {
              const isInstalled = installed.includes(m.id);
              return `
                <div class="mod-card" data-id="${m.id}" style="display: flex; flex-direction: column; padding: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: 12px; gap: 8px;">
                  <div class="mod-info">
                    <div class="mod-name" style="font-weight: 700; font-size: 15px;">${m.name}</div>
                    <div class="mod-meta" style="margin-top: 4px; display: flex; gap: 8px; align-items: center;">
                      <span class="chip chip-muted">${m.category.toUpperCase()}</span>
                      <span class="mod-rating" style="color: var(--gold); font-size: 11px; font-weight: 700;">RATING ${m.rating}</span>
                    </div>
                    <div class="mod-desc text-xs" style="margin-top: 6px; color: var(--text-2); line-height: 1.4;">${m.desc}</div>
                    <div class="mod-stats" style="margin-top: 8px; display: flex; gap: 12px;">
                      <span class="text-muted text-xs">${m.downloads} DOWNLOADS</span>
                      <span class="text-muted text-xs">${m.size}</span>
                    </div>
                    <button class="btn ${isInstalled?'btn-ghost':'btn-primary'} btn-sm mod-action-btn btn-full" style="margin-top: 10px;"
                            data-id="${m.id}" data-installed="${isInstalled}">
                      ${isInstalled ? 'INSTALLED' : 'GET'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Custom local explorer -->
        ${customMods.length > 0 ? `
          <div style="padding: 0 16px 16px;">
            <div class="section-header" style="margin-bottom: 8px;">
              <span class="section-title" style="font-weight: 700;">LOCAL MOD FILES (${customMods.length})</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${customMods.map(m => `
                <div class="card card-sm" style="display:flex; justify-content:space-between; align-items:center; padding: 10px;">
                  <div style="flex:1; min-width:0;">
                    <div style="font-weight: 700; font-size:13px;" class="truncate">${m.name}</div>
                    <div class="text-muted" style="font-size:10px; margin-top:2px;">${m.size} · ZIP/MCPACK</div>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm rename-mod-btn" data-id="${m.id}" style="padding:4px 8px; font-size:10px;">RENAME</button>
                    <button class="btn btn-ghost btn-sm download-mod-btn" data-id="${m.id}" style="padding:4px 8px; font-size:10px;">EXPORT</button>
                    <button class="btn btn-ghost btn-sm delete-mod-btn" data-id="${m.id}" style="padding:4px 8px; font-size:10px; color:var(--red);">DELETE</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Upload own mod -->
        <div style="padding: 16px;">
          <div class="upload-area" style="border: 1.5px dashed var(--border-2); border-radius: var(--r-md); padding: 18px; text-align: center;">
            <input type="file" id="mod-file-input" accept=".zip,.mcaddon,.mcpack" class="hidden" />
            <div class="upload-text" style="font-size: 13px; color: var(--text-2); margin-bottom: 8px;">Import Local Mod File</div>
            <button class="btn btn-outline btn-sm" id="btn-import-mod">Select .mcaddon / .zip</button>
            <div class="upload-hint" style="font-size: 10px; color: var(--text-3); margin-top: 6px;">Supported: .mcaddon, .mcpack, .zip files</div>
          </div>
        </div>
        <div style="height:8px;"></div>
      </div>
    `;

    // Category filter
    container.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedCat = chip.dataset.cat;
        render();
      });
    });

    // Search
    container.querySelector('#mod-search').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      container.querySelectorAll('.mod-card').forEach(card => {
        const name = card.querySelector('.mod-name').textContent.toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    });

    // Install / uninstall
    container.querySelectorAll('.mod-action-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const isInstalled = btn.dataset.installed === 'true';
        const mod = allMods.find(m => m.id === id);
        let inst = await Storage.get('installed_mods', []);

        if (isInstalled) {
          inst = inst.filter(i => i !== id);
          Toast.info('Removed Mod', mod.name);
        } else {
          btn.textContent = 'Installing...';
          btn.disabled = true;
          await new Promise(r => setTimeout(r, 1200));
          inst.push(id);
          Toast.success('Installed Mod Successfully', mod.name);
        }
        await Storage.set('installed_mods', inst);
        render();
      });
    });

    // Uninstall / Delete / Rename custom mods
    container.querySelectorAll('.uninstall-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const mod = allMods.find(m => m.id === id);
        
        if (confirm(`Bạn có chắc chắn muốn gỡ bỏ mod "${mod?.name}"?`)) {
          let inst = await Storage.get('installed_mods', []);
          inst = inst.filter(i => i !== id);
          await Storage.set('installed_mods', inst);
          Toast.info('Gỡ cài đặt mod', mod?.name || '');
          render();
        }
      });
    });

    // Custom mod row action: Rename
    container.querySelectorAll('.rename-mod-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const currentCustom = await Storage.get('custom_mods', []);
        const modIndex = currentCustom.findIndex(m => m.id === id);
        if (modIndex === -1) return;

        const newName = prompt('Nhập tên mới cho mod:', currentCustom[modIndex].name);
        if (newName === null) return;
        const cleanName = newName.trim();
        if (!cleanName) {
          Toast.error('Tên không được để trống', '');
          return;
        }

        currentCustom[modIndex].name = cleanName;
        await Storage.set('custom_mods', currentCustom);
        Toast.success('Đã đổi tên mod', cleanName);
        render();
      });
    });

    // Custom mod row action: Delete completely from device
    container.querySelectorAll('.delete-mod-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const currentCustom = await Storage.get('custom_mods', []);
        const mod = currentCustom.find(m => m.id === id);

        if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tệp mod "${mod?.name}" khỏi thiết bị?`)) {
          const updatedCustom = currentCustom.filter(m => m.id !== id);
          await Storage.set('custom_mods', updatedCustom);

          let inst = await Storage.get('installed_mods', []);
          inst = inst.filter(i => i !== id);
          await Storage.set('installed_mods', inst);

          Toast.success('Đã xóa mod', mod?.name || '');
          render();
        }
      });
    });

    // Custom mod row action: Export/Download
    container.querySelectorAll('.download-mod-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const mod = allMods.find(m => m.id === id);
        Toast.info('Đang xuất tệp mod...', mod?.name || '');

        setTimeout(() => {
          Toast.success('Xuất tệp thành công!', `Tệp ${mod?.name}.jar đã được lưu vào thư mục Downloads`);
        }, 1200);
      });
    });

    // Import Mod File implementation
    const fileInput = container.querySelector('#mod-file-input');
    const importBtn = container.querySelector('#btn-import-mod');

    if (fileInput && importBtn) {
      importBtn.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Toast.info('Importing file...', file.name);

        const reader = new FileReader();
        reader.onload = async () => {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
          const newMod = {
            id: 'custom_' + Date.now(),
            name: cleanName,
            category: 'Custom',
            version: '1.0',
            rating: 5.0,
            downloads: 'Local',
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            desc: 'Mod thủ công được cài từ thiết bị của bạn.',
          };

          const currentCustom = await Storage.get('custom_mods', []);
          currentCustom.push(newMod);
          await Storage.set('custom_mods', currentCustom);

          // Auto install the imported mod
          const currentInstalled = await Storage.get('installed_mods', []);
          currentInstalled.push(newMod.id);
          await Storage.set('installed_mods', currentInstalled);

          Toast.success('Cài đặt thành công!', `Đã thêm mod: ${cleanName}`);
          render();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  render();
}
