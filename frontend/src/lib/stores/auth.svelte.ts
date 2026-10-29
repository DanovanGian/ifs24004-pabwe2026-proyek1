export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT';
}

class AuthStore {
  user = $state<User | null>(null);
  token = $state<string | null>(null);
  isLoading = $state(true);

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) {
        this.user = JSON.parse(savedUser);
        this.token = savedToken;
      }
      this.isLoading = false;
    }
  }

  setSession(user: User, token: string) {
    this.user = user;
    this.token = token;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}

export const auth = new AuthStore();
