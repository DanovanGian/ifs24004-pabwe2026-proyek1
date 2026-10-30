import Swal from 'sweetalert2';

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(`${EVENTIFY_BASEURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Ambil pesan error spesifik dari Zod backend jika ada
      const errorMsg = data.message || (data.errors && data.errors[0]?.message) || 'Terjadi kesalahan pada request.';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    const message = error && error.message ? error.message : 'Gagal terhubung ke server';
    Swal.fire({
      icon: 'error',
      title: 'Validasi Gagal',
      text: message,
    });
    throw error;
  }
}
