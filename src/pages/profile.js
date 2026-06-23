// ============================================================
// TrLaucher — Profile Page (Account + Skin Manager)
// ============================================================

import { Auth } from '../utils/auth.js';
import { Toast } from '../components/toast.js';
import { Storage } from '../utils/storage.js';
import { CharacterPreview } from '../components/character-preview.js';

const DEFAULT_SKINS = [
  { id: 'steve',    name: 'Steve',    code: 'SV', colors: ['#C68642','#7B4F2E','#3C5986','#6699FF'] },
  { id: 'alex',     name: 'Alex',     code: 'AX', colors: ['#E2B280','#D97706','#15803D','#78350F'] },
  { id: 'zombie',   name: 'Zombie',   code: 'ZB', colors: ['#059669','#047857','#1E40AF','#1E3A8A'] },
  { id: 'skeleton', name: 'Skeleton', code: 'SK', colors: ['#E2E8F0','#CBD5E1','#475569','#334155'] },
  { id: 'creeper',  name: 'Creeper',  code: 'CP', colors: ['#10B981','#047857','#064E3B','#022C22'] },
  { id: 'enderman', name: 'Enderman', code: 'ED', colors: ['#1E1B4B','#0F172A','#6D28D9','#4C1D95'] },
  { id: 'pig',      name: 'Pig',      code: 'PG', colors: ['#FDA4AF','#F43F5E','#E11D48','#9F1239'] },
  { id: 'wolf',     name: 'Wolf',     code: 'WF', colors: ['#94A3B8','#64748B','#DC2626','#475569'] },
];

function renderSkinPreview2D(skin) {
  const colors = skin.colors;
  const hairColor = colors[0];
  const skinColor = colors[1];
  const shirtColor = colors[2];
  const pantsColor = colors[3];

  let faceHTML = '';
  if (skin.id === 'steve' || skin.id === 'alex') {
    faceHTML = `
      <!-- Eyes -->
      <div style="position:absolute; left:6px; top:16px; width:6px; height:4px; background:white;"></div>
      <div style="position:absolute; left:9px; top:16px; width:3px; height:4px; background:${skin.id === 'steve' ? '#3B82F6' : '#10B981'};"></div>
      <div style="position:absolute; right:6px; top:16px; width:6px; height:4px; background:white;"></div>
      <div style="position:absolute; right:9px; top:16px; width:3px; height:4px; background:${skin.id === 'steve' ? '#3B82F6' : '#10B981'};"></div>
      <!-- Mouth/Beard -->
      <div style="position:absolute; left:14px; top:24px; width:12px; height:4px; background:#7C2D12;"></div>
    `;
  } else if (skin.id === 'zombie') {
    faceHTML = `
      <div style="position:absolute; left:8px; top:16px; width:6px; height:6px; background:#000;"></div>
      <div style="position:absolute; right:8px; top:16px; width:6px; height:6px; background:#000;"></div>
    `;
  } else if (skin.id === 'skeleton') {
    faceHTML = `
      <div style="position:absolute; left:8px; top:16px; width:8px; height:6px; background:#334155;"></div>
      <div style="position:absolute; right:8px; top:16px; width:8px; height:6px; background:#334155;"></div>
      <div style="position:absolute; left:14px; top:26px; width:12px; height:4px; background:#334155;"></div>
    `;
  } else if (skin.id === 'creeper') {
    faceHTML = `
      <div style="position:absolute; left:8px; top:12px; width:6px; height:6px; background:#000;"></div>
      <div style="position:absolute; right:8px; top:12px; width:6px; height:6px; background:#000;"></div>
      <div style="position:absolute; left:14px; top:18px; width:12px; height:12px; background:#000;"></div>
    `;
  } else if (skin.id === 'enderman') {
    faceHTML = `
      <div style="position:absolute; left:4px; top:18px; width:10px; height:4px; background:#C084FC;"></div>
      <div style="position:absolute; right:4px; top:18px; width:10px; height:4px; background:#C084FC;"></div>
    `;
  } else if (skin.id === 'pig') {
    faceHTML = `
      <div style="position:absolute; left:6px; top:14px; width:6px; height:4px; background:#000;"></div>
      <div style="position:absolute; right:6px; top:14px; width:6px; height:4px; background:#000;"></div>
      <!-- Snout -->
      <div style="position:absolute; left:12px; top:20px; width:16px; height:8px; background:#FB7185; border-radius: 1px;"></div>
    `;
  } else if (skin.id === 'wolf') {
    faceHTML = `
      <div style="position:absolute; left:8px; top:12px; width:4px; height:4px; background:#000;"></div>
      <div style="position:absolute; right:8px; top:12px; width:4px; height:4px; background:#000;"></div>
      <div style="position:absolute; left:16px; top:18px; width:8px; height:6px; background:#E2E8F0; border-bottom:2px solid #334155;"></div>
    `;
  }

  return `
    <div class="skin-2d-wrap" style="width: 80px; height: 160px; position: relative; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <!-- Head -->
      <div style="width: 40px; height: 40px; background: ${skinColor}; position: relative; border-radius: 2px; box-shadow: inset 0 0 5px rgba(0,0,0,0.15); z-index: 3;">
        <!-- Hair (top overlay) -->
        <div style="position: absolute; top:0; left:0; right:0; height:10px; background:${hairColor}; border-radius: 2px 2px 0 0;"></div>
        ${faceHTML}
      </div>
      
      <!-- Body & Arms row -->
      <div style="display: flex; align-items: flex-start; justify-content: center; width: 64px; height: 60px; margin-top: 2px; z-index: 2;">
        <!-- Left Arm -->
        <div style="width: 12px; height: 56px; background: ${skin.id === 'zombie' ? skinColor : shirtColor}; border-radius: 2px; box-shadow: inset 0 0 5px rgba(0,0,0,0.15); margin-right: 2px;">
          <!-- Hand skin -->
          <div style="height: 12px; margin-top: 44px; background: ${skinColor}; border-radius: 0 0 2px 2px;"></div>
        </div>
        <!-- Torso -->
        <div style="width: 24px; height: 60px; background: ${shirtColor}; border-radius: 2px; box-shadow: inset 0 0 5px rgba(0,0,0,0.15); position: relative;">
          <!-- Collar detail -->
          <div style="position: absolute; top: 0; left: 6px; width: 12px; height: 4px; background: ${skinColor};"></div>
        </div>
        <!-- Right Arm -->
        <div style="width: 12px; height: 56px; background: ${skin.id === 'zombie' ? skinColor : shirtColor}; border-radius: 2px; box-shadow: inset 0 0 5px rgba(0,0,0,0.15); margin-left: 2px;">
          <!-- Hand skin -->
          <div style="height: 12px; margin-top: 44px; background: ${skinColor}; border-radius: 0 0 2px 2px;"></div>
        </div>
      </div>

      <!-- Legs row -->
      <div style="display: flex; justify-content: center; width: 24px; height: 58px; margin-top: 2px; z-index: 1;">
        <!-- Left Leg -->
        <div style="width: 11px; height: 58px; background: ${pantsColor}; border-radius: 2px; box-shadow: inset 0 0 5px rgba(0,0,0,0.15); margin-right: 1px;">
          <!-- Shoe -->
          <div style="height: 8px; margin-top: 50px; background: #374151; border-radius: 0 0 2px 2px;"></div>
        </div>
        <!-- Right Leg -->
        <div style="width: 11px; height: 58px; background: ${pantsColor}; border-radius: 2px; box-shadow: inset 0 0 5px rgba(0,0,0,0.15); margin-left: 1px;">
          <!-- Shoe -->
          <div style="height: 8px; margin-top: 50px; background: #374151; border-radius: 0 0 2px 2px;"></div>
        </div>
      </div>
    </div>
  `;
}

export async function renderProfile(container, account, onAccountUpdate) {
  // Always get fresh account
  const current = await Auth.getCurrentAccount() || account;
  const allAccounts = await Auth.getAccounts();

  const activeSkin = DEFAULT_SKINS.find(s => s.id === (current.skinId || 'steve')) || DEFAULT_SKINS[0];

  container.innerHTML = `
    <div class="page-content">
      <!-- Account Card -->
      <div class="profile-hero" style="position: relative; display: flex; flex-direction: row; gap: 16px;">
        <div class="profile-skin-preview" style="position: relative; width: 140px; height: 260px; perspective: none; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; flex-shrink: 0;">
          <canvas id="profile-char-canvas" width="280" height="520" style="width: 140px; height: 260px; cursor: grab;"></canvas>
          
          <!-- Floating Zoom Controls -->
          <div style="position: absolute; bottom: 8px; right: 8px; display: flex; flex-direction: column; gap: 4px; z-index: 10;">
            <button class="btn btn-sm btn-secondary" id="btn-zoom-in" style="padding: 2px 6px; font-size: 10px; min-width: 20px; height: 20px; font-weight: 800;">+</button>
            <button class="btn btn-sm btn-secondary" id="btn-zoom-out" style="padding: 2px 6px; font-size: 10px; min-width: 20px; height: 20px; font-weight: 800;">-</button>
          </div>
        </div>
        <div class="profile-info" style="display: flex; flex-direction: column; justify-content: center;">
          <div class="profile-name">${current.displayName}</div>
          <div class="profile-username">@${current.username}</div>
          <div class="profile-uuid font-mono text-xs" title="UUID" style="word-break: break-all; opacity: 0.7;">${current.uuid}</div>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <span class="chip chip-green">Active Session</span>
            <span class="chip chip-muted">TrLaucher</span>
          </div>
        </div>
      </div>

      <!-- 3D Customizer Section -->
      <div style="padding: 0 16px; margin-top: 16px;">
        <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span class="section-title">3D Character Customizer</span>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-ghost btn-sm" id="btn-undo" style="padding: 2px 8px; font-size: 10px;" disabled>Undo</button>
            <button class="btn btn-ghost btn-sm" id="btn-redo" style="padding: 2px 8px; font-size: 10px;" disabled>Redo</button>
          </div>
        </div>
        <div class="card card-sm">
          <div style="font-size: 11px; font-weight: 700; margin-bottom: 8px; color: var(--text-2);">Limb Visibility (Delete/Edit Parts):</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <label class="flex items-center between" style="font-size: 11px; cursor: pointer; color: var(--text);">
              <span>Đầu (Head)</span>
              <span class="toggle">
                <input type="checkbox" id="chk-part-head" checked />
                <span class="toggle-slider"></span>
              </span>
            </label>
            <label class="flex items-center between" style="font-size: 11px; cursor: pointer; color: var(--text);">
              <span>Thân (Torso)</span>
              <span class="toggle">
                <input type="checkbox" id="chk-part-torso" checked />
                <span class="toggle-slider"></span>
              </span>
            </label>
            <label class="flex items-center between" style="font-size: 11px; cursor: pointer; color: var(--text);">
              <span>Tay trái (L-Arm)</span>
              <span class="toggle">
                <input type="checkbox" id="chk-part-leftArm" checked />
                <span class="toggle-slider"></span>
              </span>
            </label>
            <label class="flex items-center between" style="font-size: 11px; cursor: pointer; color: var(--text);">
              <span>Tay phải (R-Arm)</span>
              <span class="toggle">
                <input type="checkbox" id="chk-part-rightArm" checked />
                <span class="toggle-slider"></span>
              </span>
            </label>
            <label class="flex items-center between" style="font-size: 11px; cursor: pointer; color: var(--text);">
              <span>Chân trái (L-Leg)</span>
              <span class="toggle">
                <input type="checkbox" id="chk-part-leftLeg" checked />
                <span class="toggle-slider"></span>
              </span>
            </label>
            <label class="flex items-center between" style="font-size: 11px; cursor: pointer; color: var(--text);">
              <span>Chân phải (R-Leg)</span>
              <span class="toggle">
                <input type="checkbox" id="chk-part-rightLeg" checked />
                <span class="toggle-slider"></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Skin Library -->
      <div style="padding: 0 16px;">
        <div class="section-header">
          <span class="section-title">Skin Presets</span>
          <span class="section-action" id="btn-upload-skin">Upload PNG</span>
        </div>
        <div class="skin-grid">
          ${DEFAULT_SKINS.map(s => `
            <div class="skin-item ${s.id === (current.skinId || 'steve') ? 'active' : ''}"
                 data-skin="${s.id}">
              <div class="skin-thumb" style="background:linear-gradient(135deg,${s.colors[0]},${s.colors[1]})">
                <span style="font-size:16px; font-weight:800; color:white; opacity:0.85;">${s.code}</span>
              </div>
              <span class="skin-name">${s.name}</span>
            </div>
          `).join('')}
        </div>

        <!-- Upload area -->
        <div class="upload-area" id="upload-area" style="border: 1.5px dashed var(--border-2); border-radius: var(--r-md); padding: 18px; text-align: center;">
          <input type="file" id="skin-file-input" accept="image/png" class="hidden" />
          <div class="upload-text" style="font-size: 13px; color: var(--text-2); margin-bottom: 8px;">Select a custom skin file</div>
          <button class="btn btn-outline btn-sm" id="btn-browse">Browse PNG</button>
          <div class="upload-hint" style="font-size: 10px; color: var(--text-3); margin-top: 6px;">64x64 or 128x128 Minecraft PNG format</div>
        </div>

        <!-- Skin Model -->
        <div class="card card-sm mt-3">
          <div class="flex items-center justify-between">
            <div>
              <div style="font-size:14px; font-weight:600;">Model Type</div>
              <div class="text-muted">Classic (4px arms) or Slim (3px arms)</div>
            </div>
            <div class="model-switch">
              <button class="model-btn ${(current.skinModel||'classic')==='classic'?'active':''}"
                      id="model-classic" data-model="classic">Classic</button>
              <button class="model-btn ${(current.skinModel||'classic')==='slim'?'active':''}"
                      id="model-slim" data-model="slim">Slim</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile -->
      <div style="padding: 16px 16px 0;">
        <div class="section-header">
          <span class="section-title">Modify Profile</span>
        </div>
        <div class="card card-sm">
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input type="text" id="edit-display" class="form-input"
                   value="${current.displayName}" placeholder="Tên hiển thị..." />
          </div>
          <button class="btn btn-primary btn-full" id="btn-save-profile">
            Save Changes
          </button>
        </div>
      </div>

      <!-- Account Switcher -->
      ${allAccounts.length > 1 ? `
      <div style="padding: 16px 16px 0;">
        <div class="section-header">
          <span class="section-title">Linked Accounts</span>
        </div>
        <div class="card card-sm">
          ${allAccounts.filter(a => a.id !== current.id).map(a => `
            <div class="list-item" data-account-id="${a.id}" style="padding:10px 4px;">
              <div class="list-item-icon" style="background:var(--surface-2); font-size:12px; font-weight:800; width:38px; height:38px;">
                ${a.displayName.charAt(0).toUpperCase()}
              </div>
              <div class="list-item-body">
                <div class="list-item-title">${a.displayName}</div>
                <div class="list-item-sub">@${a.username}</div>
              </div>
              <button class="btn btn-ghost btn-sm switch-account" data-id="${a.id}">Switch</button>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Logout -->
      <div style="padding: 16px;">
        <button class="btn btn-outline btn-full" id="btn-logout" style="border-color:var(--danger-dim); color:var(--danger);">
          Logout
        </button>
      </div>
    </div>
  `;

  // Skin selection
  container.querySelectorAll('.skin-item').forEach(item => {
    item.addEventListener('click', async () => {
      const skinId = item.dataset.skin;
      container.querySelectorAll('.skin-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');

      const skin = DEFAULT_SKINS.find(s => s.id === skinId);
      await Auth.updateAccount(current.id, { skinId, skinData: null });

      Toast.success('Skin đã thay đổi!', `Đang dùng skin: ${skin.name}`);
      if (onAccountUpdate) onAccountUpdate();
      await renderProfile(container, current, onAccountUpdate);
    });
  });

  // Model switch
  container.querySelectorAll('.model-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      container.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await Auth.updateAccount(current.id, { skinModel: btn.dataset.model });
      Toast.info('Model đã đổi', btn.dataset.model === 'slim' ? 'Đang dùng Slim (3px)' : 'Đang dùng Classic (4px)');
      if (onAccountUpdate) onAccountUpdate();
    });
  });

  // Upload skin
  container.querySelector('#btn-browse').addEventListener('click', () => {
    container.querySelector('#skin-file-input').click();
  });
  container.querySelector('#btn-upload-skin').addEventListener('click', () => {
    container.querySelector('#skin-file-input').click();
  });

  container.querySelector('#skin-file-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes('png')) {
      Toast.error('File không hợp lệ', 'Chỉ chấp nhận file PNG');
      return;
    }
    const reader = new FileReader();
    reader.onload = async ev => {
      const base64 = ev.target.result;
      await Auth.updateAccount(current.id, { skinData: base64, skinId: 'custom' });
      Toast.success('Skin đã upload!', 'Skin tùy chỉnh của bạn đã được lưu');
      if (onAccountUpdate) onAccountUpdate();
      await renderProfile(container, current, onAccountUpdate);
    };
    reader.readAsDataURL(file);
  });

  // Save profile
  container.querySelector('#btn-save-profile').addEventListener('click', async () => {
    const display = container.querySelector('#edit-display').value.trim();
    if (!display) { Toast.error('Lỗi', 'Tên hiển thị không được trống'); return; }
    await Auth.updateAccount(current.id, { displayName: display });
    Toast.success('Đã lưu!', 'Thông tin hồ sơ đã được cập nhật');
    container.querySelector('.profile-name').textContent = display;
    if (onAccountUpdate) onAccountUpdate();
  });

  // Switch account
  container.querySelectorAll('.switch-account').forEach(btn => {
    btn.addEventListener('click', async () => {
      const accounts = await Auth.getAccounts();
      const acc = accounts.find(a => a.id === btn.dataset.id);
      if (acc) {
        await Auth.loginWithAccount(acc);
        Toast.success('Đã chuyển tài khoản', `Xin chào, ${acc.displayName}!`);
        if (onAccountUpdate) onAccountUpdate();
        await renderProfile(container, acc, onAccountUpdate);
      }
    });
  });

  // Logout
  container.querySelector('#btn-logout').addEventListener('click', async () => {
    await Auth.logout();
    window.location.reload();
  });

  // Initialize interactive character preview canvas
  const canvas = container.querySelector('#profile-char-canvas');
  if (canvas) {
    const preview = new CharacterPreview(canvas, current.skinData || activeSkin, current.skinModel || 'classic');

    // Undo / Redo Stacks
    let history = [];
    let historyIndex = -1;

    function pushHistoryState() {
      const state = {
        skinId: current.skinId || 'steve',
        skinData: current.skinData || null,
        visibleParts: { ...preview.visibleParts }
      };
      // Cut off redo stack branches
      history = history.slice(0, historyIndex + 1);
      history.push(JSON.parse(JSON.stringify(state)));
      historyIndex = history.length - 1;
      updateHistoryButtons();
    }

    function updateHistoryButtons() {
      const undoBtn = container.querySelector('#btn-undo');
      const redoBtn = container.querySelector('#btn-redo');
      if (undoBtn) undoBtn.disabled = historyIndex <= 0;
      if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
    }

    async function applyHistoryState(state) {
      if (!state) return;
      
      // Sync visibility
      Object.keys(state.visibleParts).forEach(part => {
        preview.visibleParts[part] = state.visibleParts[part];
        const chk = container.querySelector(`#chk-part-${part}`);
        if (chk) chk.checked = state.visibleParts[part];
      });

      // Sync skin
      if (state.skinId !== current.skinId || state.skinData !== current.skinData) {
        current.skinId = state.skinId;
        current.skinData = state.skinData;
        const skinItem = DEFAULT_SKINS.find(s => s.id === state.skinId);
        const data = state.skinData || (skinItem ? skinItem : null);
        preview.updateSkin(data, current.skinModel || 'classic');

        container.querySelectorAll('.skin-item').forEach(item => {
          item.classList.toggle('active', item.dataset.skin === state.skinId);
        });
        await Auth.updateAccount(current.id, { skinId: state.skinId, skinData: state.skinData });
      }
      updateHistoryButtons();
    }

    // Push initial state
    pushHistoryState();

    // Zoom bindings
    container.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
      preview.zoom = Math.min(8.0, preview.zoom + 0.5);
    });
    container.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
      preview.zoom = Math.max(2.5, preview.zoom - 0.5);
    });

    // Undo/Redo listeners
    container.querySelector('#btn-undo')?.addEventListener('click', () => {
      if (historyIndex > 0) {
        historyIndex--;
        applyHistoryState(history[historyIndex]);
      }
    });
    container.querySelector('#btn-redo')?.addEventListener('click', () => {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        applyHistoryState(history[historyIndex]);
      }
    });

    // Limb toggling listeners
    Object.keys(preview.visibleParts).forEach(part => {
      container.querySelector(`#chk-part-${part}`)?.addEventListener('change', (e) => {
        preview.setPartVisibility(part, e.target.checked);
        pushHistoryState();
      });
    });

    // Intercept skin selections to save states
    container.querySelectorAll('.skin-item').forEach(item => {
      item.addEventListener('click', () => {
        setTimeout(pushHistoryState, 100);
      });
    });
  }
}
