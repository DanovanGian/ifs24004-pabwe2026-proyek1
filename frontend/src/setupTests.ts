import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 1. Mock window.matchMedia untuk SweetAlert2 di jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 2. Mock SweetAlert2 agar tidak bentrok dengan DOM jsdom
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// 3. Mock $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  prefetch: vi.fn(),
  prefetchRoutes: vi.fn(),
}));

// 4. Mock $app/state
vi.mock('$app/state', () => ({
  page: {
    url: new URL('http://localhost:3002/'),
    params: {},
    route: { id: '/' },
    status: 200,
    error: null,
    data: {},
    state: {},
  },
}));
