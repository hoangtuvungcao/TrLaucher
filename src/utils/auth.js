// ============================================================
// TrLaucher — Auth Utility
// Custom account system (no Microsoft) — local storage based
// ============================================================

import { Storage } from './storage.js';

// Simple hash function (SHA-256 via Web Crypto)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'trlaucher_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Generate session token
function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export const Auth = {
  // Register new account
  async register(username, password, displayName = null) {
    const accounts = await Storage.get('accounts', []);

    // Validate username
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
      throw new Error('Tên người dùng phải 3-16 ký tự, chỉ chứa chữ cái, số và _');
    }

    // Check duplicate
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Tên người dùng đã tồn tại');
    }

    const hash = await hashPassword(password);
    const account = {
      id: generateUUID(),
      username,
      displayName: displayName || username,
      passwordHash: hash,
      uuid: generateUUID(),
      skinData: null,
      skinModel: 'classic', // classic | slim
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    accounts.push(account);
    await Storage.set('accounts', accounts);

    // Auto login
    return await this.loginWithAccount(account);
  },

  // Login with username + password
  async login(username, password) {
    const accounts = await Storage.get('accounts', []);
    const account = accounts.find(
      a => a.username.toLowerCase() === username.toLowerCase()
    );

    if (!account) throw new Error('Tài khoản không tồn tại');

    const hash = await hashPassword(password);
    if (hash !== account.passwordHash) throw new Error('Mật khẩu không đúng');

    return await this.loginWithAccount(account);
  },

  async loginWithAccount(account) {
    const session = {
      accountId: account.id,
      token: generateToken(),
      loginAt: Date.now(),
    };
    await Storage.set('session', session);

    // Update lastLogin
    const accounts = await Storage.get('accounts', []);
    const idx = accounts.findIndex(a => a.id === account.id);
    if (idx >= 0) {
      accounts[idx].lastLogin = Date.now();
      await Storage.set('accounts', accounts);
    }

    return { account, session };
  },

  // Get current logged-in account
  async getCurrentAccount() {
    const session = await Storage.get('session', null);
    if (!session) return null;

    const accounts = await Storage.get('accounts', []);
    return accounts.find(a => a.id === session.accountId) || null;
  },

  // Logout
  async logout() {
    await Storage.remove('session');
  },

  // Get all accounts
  async getAccounts() {
    return await Storage.get('accounts', []);
  },

  // Update account profile
  async updateAccount(id, updates) {
    const accounts = await Storage.get('accounts', []);
    const idx = accounts.findIndex(a => a.id === id);
    if (idx < 0) throw new Error('Account not found');
    accounts[idx] = { ...accounts[idx], ...updates };
    await Storage.set('accounts', accounts);
    return accounts[idx];
  },

  // Delete account
  async deleteAccount(id) {
    let accounts = await Storage.get('accounts', []);
    accounts = accounts.filter(a => a.id !== id);
    await Storage.set('accounts', accounts);
    const session = await Storage.get('session', null);
    if (session?.accountId === id) await Storage.remove('session');
  },

  // Check if session is valid
  async isLoggedIn() {
    const session = await Storage.get('session', null);
    if (!session) return false;
    const account = await this.getCurrentAccount();
    return !!account;
  },
};
