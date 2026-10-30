export function initTheme() {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;

  if (isDark) {
    document.documentElement.classList.add('dark');
    return 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    return 'light';
  }
}

export function toggleTheme(): 'light' | 'dark' {
  // Aktifkan transisi halus
  document.documentElement.classList.add('theme-transitioning');

  const isDark = document.documentElement.classList.toggle('dark');
  const theme = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', theme);

  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 300);

  return theme;
}
