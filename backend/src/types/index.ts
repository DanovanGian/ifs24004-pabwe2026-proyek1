export type UserRole = 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type EventStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quota: number;
  availableQuota: number;
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  categoryId: string;
  date: string;
  location: string;
  status: EventStatus;
  ticketTypes: TicketType[];
  createdAt: string;
}

export interface Registration {
  id: string;
  participantId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

export interface Ticket {
  id: string;
  registrationId: string;
  participantId: string;
  eventId: string;
  ticketTypeId: string;
  qrToken: string;
  isUsed: boolean;
  checkedInAt: string | null;
  createdAt: string;
}
