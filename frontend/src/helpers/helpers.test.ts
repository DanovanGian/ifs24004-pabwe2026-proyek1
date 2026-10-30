import { describe, it, expect, vi } from 'vitest';
import { cn, formatRupiah } from './toolsHelper.ts';
import { apiRequest } from './apiHelper.ts';
import { useInput } from '../hooks/useInput.ts';

describe('1. Tools Helper & Custom Hooks', () => {
  it('cn() harus menggabungkan class dengan benar', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    expect(cn('text-red-500', false && 'hidden')).toBe('text-red-500');
  });

  it('formatRupiah() harus memformat mata uang rupiah', () => {
    const formatted = formatRupiah(50000);
    expect(formatted).toContain('50.000');
  });

  it('useInput hook harus menangani input dan reset nilai', () => {
    const input = useInput('awal');
    expect(input.value).toBe('awal');

    input.onChange({ target: { value: 'baru' } } as any);
    expect(input.value).toBe('baru');

    input.value = 'langsung';
    expect(input.value).toBe('langsung');

    input.reset();
    expect(input.value).toBe('awal');
  });

  it('apiRequest() harus berhasil memanggil fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: [] }),
    });

    const res = await apiRequest('/test');
    expect(res.status).toBe('success');
  });

  it('apiRequest() harus melempar error jika respon tidak ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Gagal' }),
    });

    await expect(apiRequest('/gagal')).rejects.toThrow('Gagal');
  });
});
