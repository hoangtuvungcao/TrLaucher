// ============================================================
// TrLaucher — Auth Page (Login / Register)
// ============================================================

import { Auth } from '../utils/auth.js';
import { Toast } from '../components/toast.js';

export function renderAuth(onSuccess) {
  const el = document.getElementById('auth-screen');
  let activeTab = 'login';

  el.innerHTML = `
    <div class="auth-bg-particles" id="auth-particles"></div>
    <div class="auth-logo">
      <div class="logo-text">TrLaucher</div>
      <div class="logo-sub">LAUNCHER MINECRAFT PE</div>
    </div>

    <div class="auth-card">
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login" data-tab="login">ĐĂNG NHẬP</button>
        <button class="auth-tab" id="tab-register" data-tab="register">ĐĂNG KÝ</button>
      </div>

      <!-- Login Form -->
      <form id="form-login" autocomplete="off">
        <div class="form-group">
          <label class="form-label">Tên người dùng</label>
          <input type="text" id="login-username" class="form-input"
            placeholder="Nhập tên người dùng..." autocomplete="username" />
        </div>
        <div class="form-group">
          <label class="form-label">Mật khẩu</label>
          <input type="password" id="login-password" class="form-input"
            placeholder="Nhập mật khẩu..." autocomplete="current-password" />
        </div>
        <button type="submit" class="btn btn-primary mt-4 btn-full" id="btn-login">
          Đăng Nhập
        </button>
      </form>

      <!-- Register Form -->
      <form id="form-register" autocomplete="off" style="display:none;">
        <div class="form-group">
          <label class="form-label">Tên người dùng</label>
          <input type="text" id="reg-username" class="form-input"
            placeholder="3-16 ký tự, a-z 0-9 _" autocomplete="username" />
        </div>
        <div class="form-group">
          <label class="form-label">Tên hiển thị (tuỳ chọn)</label>
          <input type="text" id="reg-display" class="form-input"
            placeholder="Tên hiển thị trong game..." />
        </div>
        <div class="form-group">
          <label class="form-label">Mật khẩu</label>
          <input type="password" id="reg-password" class="form-input"
            placeholder="Tối thiểu 6 ký tự..." autocomplete="new-password" />
        </div>
        <div class="form-group">
          <label class="form-label">Xác nhận mật khẩu</label>
          <input type="password" id="reg-confirm" class="form-input"
            placeholder="Nhập lại mật khẩu..." autocomplete="new-password" />
        </div>
        <button type="submit" class="btn btn-primary mt-4 btn-full" id="btn-register">
          Tạo Tài Khoản
        </button>
      </form>

      <div class="divider-text mt-4">
        <span>hoặc tiếp tục với</span>
      </div>
      <button class="btn btn-ghost btn-full" id="btn-quick-play" style="margin-top:0;">
        Chơi Nhanh
      </button>
    </div>

    <div class="auth-footer">
      <span>TrLaucher v1.0.0</span>
      <span>·</span>
      <span>Minecraft PE Launcher</span>
    </div>
  `;

  // Tab switching
  el.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      el.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const loginForm = el.querySelector('#form-login');
      const regForm = el.querySelector('#form-register');
      if (activeTab === 'login') {
        loginForm.style.display = '';
        regForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        regForm.style.display = '';
      }
    });
  });

  // Login submit
  el.querySelector('#form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = el.querySelector('#btn-login');
    const username = el.querySelector('#login-username').value.trim();
    const password = el.querySelector('#login-password').value;

    if (!username || !password) {
      Toast.error('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    btn.classList.add('loading');
    btn.textContent = '';
    try {
      const { account } = await Auth.login(username, password);
      Toast.success('Chào mừng!', `Xin chào, ${account.displayName}!`);
      setTimeout(() => onSuccess(account), 500);
    } catch (err) {
      Toast.error('Đăng nhập thất bại', err.message);
    } finally {
      btn.classList.remove('loading');
      btn.textContent = 'Đăng Nhập';
    }
  });

  // Register submit
  el.querySelector('#form-register').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = el.querySelector('#btn-register');
    const username = el.querySelector('#reg-username').value.trim();
    const display  = el.querySelector('#reg-display').value.trim();
    const password = el.querySelector('#reg-password').value;
    const confirm  = el.querySelector('#reg-confirm').value;

    if (!username || !password) {
      Toast.error('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password.length < 6) {
      Toast.error('Mật khẩu quá ngắn', 'Mật khẩu cần ít nhất 6 ký tự');
      return;
    }
    if (password !== confirm) {
      Toast.error('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu');
      return;
    }

    btn.classList.add('loading');
    btn.textContent = '';
    try {
      const { account } = await Auth.register(username, password, display || username);
      Toast.success('Tạo tài khoản thành công!', `Chào mừng, ${account.displayName}!`);
      setTimeout(() => onSuccess(account), 500);
    } catch (err) {
      Toast.error('Đăng ký thất bại', err.message);
    } finally {
      btn.classList.remove('loading');
      btn.textContent = 'Tạo Tài Khoản';
    }
  });

  // Quick Play
  el.querySelector('#btn-quick-play').addEventListener('click', async () => {
    try {
      // Register/login a guest account automatically
      const guestName = `Guest_${Math.floor(Math.random() * 9000 + 1000)}`;
      const { account } = await Auth.register(guestName, 'trlauncher_guest_' + Date.now());
      Toast.info('Chế độ khách', `Chơi với tên: ${guestName}`);
      setTimeout(() => onSuccess(account), 500);
    } catch (err) {
      Toast.error('Lỗi', err.message);
    }
  });
}
