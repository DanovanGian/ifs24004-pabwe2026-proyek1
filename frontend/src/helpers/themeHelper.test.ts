import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initTheme, toggleTheme } from './themeHelper';

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe('themeHelper', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('initTheme memakai tema tersimpan dark', () => {
    localStorage.setItem('theme', 'dark');
    expect(initTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('initTheme memakai tema tersimpan light', () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.add('dark');
    expect(initTheme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('initTheme mengikuti preferensi sistem dark jika belum tersimpan', () => {
    mockMatchMedia(true);
    expect(initTheme()).toBe('dark');
  });

  it('initTheme default light jika sistem tidak dark', () => {
    expect(initTheme()).toBe('light');
  });

  it('initTheme mengembalikan light saat window tidak ada (SSR)', () => {
    vi.stubGlobal('window', undefined);
    expect(initTheme()).toBe('light');
  });

  it('toggleTheme berpindah ke dark lalu light dan menyimpan ke localStorage', () => {
    vi.useFakeTimers();
    expect(toggleTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);

    vi.advanceTimersByTime(300);
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);

    expect(toggleTheme()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
