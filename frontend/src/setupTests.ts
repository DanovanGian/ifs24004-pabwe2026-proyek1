import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  prefetch: vi.fn(),
  prefetchRoutes: vi.fn(),
}));

// Mock $app/state
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
