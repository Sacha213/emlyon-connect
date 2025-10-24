import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://reetmakfmlwhpsglgnqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZXRtYWtmbWx3aHBzZ2xnbnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDI3OTIsImV4cCI6MjA3Njc3ODc5Mn0.NljRGNZvz8IKxFlg_aBogg79OyRnxZ1JUrZMV42iHiA'; // ⚠️ À REMPLACER par votre clé anon

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Types pour TypeScript
export interface Database {
    public: {
        Tables: {
            User: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    promotion: string;
                    avatarUrl: string;
                    createdAt: string;
                    updatedAt: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name: string;
                    promotion?: string;
                    avatarUrl?: string;
                    createdAt?: string;
                    updatedAt?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    promotion?: string;
                    avatarUrl?: string;
                    updatedAt?: string;
                };
            };
            CheckIn: {
                Row: {
                    id: string;
                    userId: string;
                    locationName: string;
                    latitude: number;
                    longitude: number;
                    statusEmoji: string | null;
                    createdAt: string;
                    updatedAt: string;
                };
                Insert: {
                    id?: string;
                    userId: string;
                    locationName: string;
                    latitude: number;
                    longitude: number;
                    statusEmoji?: string | null;
                    createdAt?: string;
                    updatedAt?: string;
                };
                Update: {
                    locationName?: string;
                    latitude?: number;
                    longitude?: number;
                    statusEmoji?: string | null;
                    updatedAt?: string;
                };
            };
            Event: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    date: string;
                    creatorId: string;
                    createdAt: string;
                    updatedAt: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description: string;
                    date: string;
                    creatorId: string;
                    createdAt?: string;
                    updatedAt?: string;
                };
                Update: {
                    title?: string;
                    description?: string;
                    date?: string;
                    updatedAt?: string;
                };
            };
            EventAttendee: {
                Row: {
                    id: string;
                    eventId: string;
                    userId: string;
                    createdAt: string;
                };
                Insert: {
                    id?: string;
                    eventId: string;
                    userId: string;
                    createdAt?: string;
                };
            };
        };
    };
}
