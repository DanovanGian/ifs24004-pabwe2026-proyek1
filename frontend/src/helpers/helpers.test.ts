import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, formatRupiah } from './toolsHelper.ts';
import { apiRequest } from './apiHelper.ts';
import { useInput } from '../hooks/useInput.ts';

describe('1. Tools Helper & Custom Hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

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

    input.onChange({} as any);
    expect(input.value).toBe('');

    input.value = 'langsung';
    expect(input.value).toBe('langsung');

    input.reset();
    expect(input.value).toBe('awal');
  });

  it('apiRequest() harus berhasil memanggil fetch dengan dan tanpa token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: [] }),
    });

    // Cabang tanpa token & tanpa headers tambahan
    const res = await apiRequest('/test');
    expect(res.status).toBe('success');

    // Cabang dengan token tersimpan & dengan headers tambahan
    localStorage.setItem('token', 'mock_token_123');
    const resWithToken = await apiRequest('/test-with-token', { headers: { 'X-Custom': '1' } });
    expect(resWithToken.status).toBe('success');
  });

  it('apiRequest() menangani respon tidak ok dengan pesan kustom', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Gagal Kustom' }),
    });

    await expect(apiRequest('/gagal')).rejects.toThrow('Gagal Kustom');
  });

  it('apiRequest() menangani respon tidak ok tanpa field message (fallback default)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}), // data tanpa property message
    });

    await expect(apiRequest('/empty-error')).rejects.toThrow('Terjadi kesalahan pada request.');
  });

  it('apiRequest() menangani json parse error dan fallback pesan error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => { throw new Error(); }, // memicu .catch(() => ({}))
    });

    await expect(apiRequest('/json-error')).rejects.toThrow('Terjadi kesalahan pada request.');
  });

  it('apiRequest() menangani error jaringan tanpa pesan', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      throw {}; // Error tanpa property message
    });

    await expect(apiRequest('/network-error')).rejects.toEqual({});
  });
});
