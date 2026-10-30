import { describe, it, expect } from 'vitest';
import { renderWithProviders } from './test-utils.ts';
import ErrorPage from './routes/+error.svelte';

describe('2. Routing & Component Tests', () => {
  it('harus merender halaman error dengan benar', () => {
    const { getByText } = renderWithProviders(ErrorPage);
    expect(getByText('Halaman Tidak Ditemukan')).toBeInTheDocument();
  });
});
