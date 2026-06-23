let container = null;

function getContainer() {
  if (!container) {
    container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  }
  return container;
}

export function showToast(type, title, message = '', duration = 3200) {
  const c = getContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <div class="toast-dot"></div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;
  c.appendChild(el);

  const t = setTimeout(() => dismiss(el), duration);
  el.addEventListener('click', () => { clearTimeout(t); dismiss(el); });
  return el;
}

function dismiss(el) {
  el.classList.add('out');
  setTimeout(() => el.remove(), 250);
}

export const Toast = {
  success: (title, msg, d) => showToast('success', title, msg, d),
  error:   (title, msg, d) => showToast('error',   title, msg, d),
  info:    (title, msg, d) => showToast('info',     title, msg, d),
  warn:    (title, msg, d) => showToast('warn',     title, msg, d),
};
