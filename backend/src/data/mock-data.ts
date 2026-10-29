import { hashPassword } from '../utils/hash.ts';
import type { User, Category, Event } from '../types/index.ts';

export async function getInitialMockData() {
  const defaultPassword = await hashPassword('password123');

  const users: User[] = [
    {
      id: 'usr-admin-1',
      name: 'System Administrator',
      email: 'admin@eventify.com',
      passwordHash: defaultPassword,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-org-1',
      name: 'Tech Events Organizer',
      email: 'organizer@eventify.com',
      passwordHash: defaultPassword,
      role: 'ORGANIZER',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-part-1',
      name: 'Budi Participant',
      email: 'budi@gmail.com',
      passwordHash: defaultPassword,
      role: 'PARTICIPANT',
      createdAt: new Date().toISOString(),
    },
  ];

  const categories: Category[] = [
    { id: 'cat-1', name: 'Teknologi & AI', slug: 'teknologi-ai' },
    { id: 'cat-2', name: 'Musik & Konser', slug: 'musik-konser' },
    { id: 'cat-3', name: 'Bisnis & Karir', slug: 'bisnis-karir' },
  ];

  const events: Event[] = [
    {
      id: 'evt-1',
      organizerId: 'usr-org-1',
      title: 'Fullstack Modern Summit 2025',
      description: 'Konferensi teknologi modern seputar SvelteKit, Bun, dan arsitektur web desktop terkini.',
      categoryId: 'cat-1',
      date: '2025-11-20T09:00:00Z',
      location: 'Grand Ballroom Jakarta / Hybrid',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      ticketTypes: [
        {
          id: 'tkt-1',
          eventId: 'evt-1',
          name: 'Regular Pass',
          price: 150000,
          quota: 100,
          availableQuota: 98,
        },
        {
          id: 'tkt-2',
          eventId: 'evt-1',
          name: 'VIP Front Row',
          price: 450000,
          quota: 20,
          availableQuota: 19,
        }
      ]
    }
  ];

  return { users, categories, events };
}
