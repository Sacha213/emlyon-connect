export interface User {
  id: string;
  name: string;
  avatarUrl: string; // data URL or a link
  promotion?: string; // Promotion EMlyon (ex: EMI 2024, EMI 2025)
}

export interface CheckIn {
  id: string;
  user: User;
  locationName: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  statusEmoji?: string; // e.g., '🍻', '📚', '🏋️'
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: number;
  creator: User;
  attendees: User[];
}

export type AppView = 'presence' | 'events';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}