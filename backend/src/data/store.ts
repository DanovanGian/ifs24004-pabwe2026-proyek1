import type { User, Category, Event, Registration, Ticket } from '../types/index.ts';
import { getInitialMockData } from './mock-data.ts';

class MemoryStore {
  public users: User[] = [];
  public categories: Category[] = [];
  public events: Event[] = [];
  public registrations: Registration[] = [];
  public tickets: Ticket[] = [];
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    const initial = await getInitialMockData();
    this.users = initial.users;
    this.categories = initial.categories;
    this.events = initial.events;
    this.isInitialized = true;
    console.log('📦 In-Memory Data Store terinisialisasi dengan mock data.');
  }
}

export const db = new MemoryStore();
