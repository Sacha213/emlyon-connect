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
  latitude: number | null;
  longitude: number | null;
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
  category?: string; // Catégorie de l'événement (Soirée, Sport, Culture, etc.)
}

export interface Feedback {
  id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  creator: User;
  createdAt: number;
  upvotes: string[]; // Array of user IDs who upvoted
  comments: FeedbackComment[];
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  user: User;
  content: string;
  createdAt: number;
}

export interface Place {
  id: string;
  name: string;
  category: 'restaurant' | 'bar' | 'cafe' | 'shop' | 'fast_food';
  latitude: number;
  longitude: number;
  address?: string;
}

export type AppView = 'presence' | 'events' | 'feedback';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}