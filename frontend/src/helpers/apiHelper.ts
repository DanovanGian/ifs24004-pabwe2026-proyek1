import Swal from 'sweetalert2';

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
      throw new Error(data.message || 'Terjadi kesalahan pada request.');
    }

    return data;
  } catch (error: any) {
    if (typeof window !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'Gagal terhubung ke server',
      });
    }
    throw error;
  }
}
