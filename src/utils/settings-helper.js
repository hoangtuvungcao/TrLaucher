// ============================================================
// TrLaucher — Settings Applier
// Dynamically overrides CSS variables on boot & changes
// ============================================================

export function applyAppSettings(settings) {
  if (!settings) return;
  const root = document.documentElement;

  // Apply accent color variables
  const accents = {
    green:  { val: '#10B981', glow: 'rgba(16, 185, 129, 0.2)', subtle: 'rgba(16, 185, 129, 0.05)' },
    blue:   { val: '#3B82F6', glow: 'rgba(59, 130, 246, 0.2)', subtle: 'rgba(59, 130, 246, 0.05)' },
    purple: { val: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.2)', subtle: 'rgba(139, 92, 246, 0.05)' },
    orange: { val: '#F97316', glow: 'rgba(249, 115, 22, 0.2)', subtle: 'rgba(249, 115, 22, 0.05)' },
    red:    { val: '#EF4444', glow: 'rgba(239, 68, 68, 0.2)', subtle: 'rgba(239, 68, 68, 0.05)' }
  };

  const a = accents[settings.accentColor || 'green'];
  if (a) {
    root.style.setProperty('--green', a.val);
    root.style.setProperty('--green-glow', a.glow);
    root.style.setProperty('--green-subtle', a.subtle);
  }

  // Apply theme variables
  const body = document.body;
  body.classList.remove('theme-light', 'theme-oled');
  
  if (settings.theme === 'light') {
    body.classList.add('theme-light');
    root.style.setProperty('--bg', '#F8FAFC');
    root.style.setProperty('--bg-deep', '#E2E8F0');
    root.style.setProperty('--surface', '#FFFFFF');
    root.style.setProperty('--surface-2', '#F1F5F9');
    root.style.setProperty('--surface-3', '#E2E8F0');
    root.style.setProperty('--text', '#0F172A');
    root.style.setProperty('--text-2', '#475569');
    root.style.setProperty('--text-3', '#64748B');
    root.style.setProperty('--border', 'rgba(0, 0, 0, 0.06)');
    root.style.setProperty('--border-2', 'rgba(0, 0, 0, 0.12)');
    root.style.setProperty('--grad-dark', 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)');
  } else if (settings.theme === 'oled') {
    body.classList.add('theme-oled');
    root.style.setProperty('--bg', '#000000');
    root.style.setProperty('--bg-deep', '#000000');
    root.style.setProperty('--surface', '#050505');
    root.style.setProperty('--surface-2', '#0A0A0A');
    root.style.setProperty('--surface-3', '#121212');
    root.style.setProperty('--text', '#F8FAFC');
    root.style.setProperty('--text-2', '#94A3B8');
    root.style.setProperty('--text-3', '#64748B');
    root.style.setProperty('--border', 'rgba(255, 255, 255, 0.03)');
    root.style.setProperty('--border-2', 'rgba(255, 255, 255, 0.06)');
    root.style.setProperty('--grad-dark', 'linear-gradient(180deg, #000000 0%, #000000 100%)');
  } else {
    // Dark theme (Default)
    root.style.setProperty('--bg', '#07090e');
    root.style.setProperty('--bg-deep', '#030406');
    root.style.setProperty('--surface', '#0D111C');
    root.style.setProperty('--surface-2', '#121828');
    root.style.setProperty('--surface-3', '#182036');
    root.style.setProperty('--text', '#F8FAFC');
    root.style.setProperty('--text-2', '#94A3B8');
    root.style.setProperty('--text-3', '#64748B');
    root.style.setProperty('--border', 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--border-2', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--grad-dark', 'linear-gradient(180deg, #0A0E1A 0%, #06080F 100%)');
  }
}
