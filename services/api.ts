import { supabase } from './supabaseClient';
import type { User, CheckIn, Event } from '../types';

// Fonction pour générer un UUID v4
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ==================== CHECK-INS ====================

export const getAllCheckIns = async (): Promise<CheckIn[]> => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('CheckIn')
        .select(`
      *,
      user:User (
        id,
        name,
        avatarUrl,
        promotion
      )
    `)
        .gte('createdAt', twentyFourHoursAgo)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Erreur lors du chargement des check-ins:', error);
        return [];
    }

    return (data || []).map((checkIn: any) => {
        // Ajouter 'Z' pour forcer l'interprétation en UTC
        const timestamp = new Date(checkIn.createdAt + 'Z').getTime();

        return {
            id: checkIn.id,
            user: checkIn.user,
            locationName: checkIn.locationName,
            latitude: checkIn.latitude,
            longitude: checkIn.longitude,
            timestamp,
            statusEmoji: checkIn.statusEmoji
        };
    });
};

export const createCheckIn = async (
    userId: string,
    locationName: string,
    coords: { latitude: number; longitude: number },
    statusEmoji: string | null
): Promise<CheckIn | null> => {
    // 1. Supprimer les anciens check-ins de l'utilisateur
    await supabase
        .from('CheckIn')
        .delete()
        .eq('userId', userId);

    // 2. Créer le nouveau check-in avec un ID généré
    const { data, error } = await supabase
        .from('CheckIn')
        .insert({
            id: generateUUID(),
            userId,
            locationName,
            latitude: coords.latitude,
            longitude: coords.longitude,
            statusEmoji
        })
        .select(`
      *,
      user:User (
        id,
        name,
        avatarUrl,
        promotion
      )
    `)
        .single();

    if (error) {
        console.error('Erreur lors de la création du check-in:', error);
        return null;
    }

    return {
        id: data.id,
        user: data.user,
        locationName: data.locationName,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(data.createdAt).getTime(),
        statusEmoji: data.statusEmoji
    };
};

export const deleteCheckIn = async (checkInId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('CheckIn')
        .delete()
        .eq('id', checkInId);

    if (error) {
        console.error('Erreur lors de la suppression du check-in:', error);
        return false;
    }

    return true;
};

// ==================== EVENTS ====================

export const getAllEvents = async (): Promise<Event[]> => {
    const { data, error } = await supabase
        .from('Event')
        .select(`
      *,
      creator:User!Event_creatorId_fkey (
        id,
        name,
        avatarUrl
      ),
      attendees:EventAttendee (
        user:User (
          id,
          name,
          avatarUrl
        )
      )
    `)
        .order('date', { ascending: true });

    if (error) {
        console.error('Erreur lors du chargement des événements:', error);
        return [];
    }

    return (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: new Date(event.date + 'Z').getTime(), // Forcer UTC
        creator: event.creator,
        attendees: event.attendees.map((a: any) => a.user)
    }));
};

export const createEvent = async (
    userId: string,
    title: string,
    description: string,
    date: number
): Promise<Event | null> => {
    // 1. Créer l'événement avec un ID généré
    const eventId = generateUUID();
    const { data: eventData, error: eventError } = await supabase
        .from('Event')
        .insert({
            id: eventId,
            title,
            description,
            date: new Date(date).toISOString(),
            creatorId: userId
        })
        .select(`
      *,
      creator:User!Event_creatorId_fkey (
        id,
        name,
        avatarUrl
      )
    `)
        .single();

    if (eventError) {
        console.error('Erreur lors de la création de l\'événement:', eventError);
        return null;
    }

    // 2. Ajouter automatiquement le créateur comme participant
    await supabase
        .from('EventAttendee')
        .insert({
            eventId: eventData.id,
            userId
        });

    return {
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date + 'Z').getTime(), // Forcer UTC
        creator: eventData.creator,
        attendees: [eventData.creator]
    };
};

export const attendEvent = async (eventId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('EventAttendee')
        .insert({
            eventId,
            userId
        });

    if (error) {
        console.error('Erreur lors de la participation à l\'événement:', error);
        return false;
    }

    return true;
};

export const unattendEvent = async (eventId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('EventAttendee')
        .delete()
        .eq('eventId', eventId)
        .eq('userId', userId);

    if (error) {
        console.error('Erreur lors de l\'annulation de participation:', error);
        return false;
    }

    return true;
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('Event')
        .delete()
        .eq('id', eventId);

    if (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        return false;
    }

    return true;
};

// ==================== USER ====================

export const updateUserProfile = async (userId: string, updates: { name?: string; promotion?: string; avatarUrl?: string }): Promise<User | null> => {
    const { data, error } = await supabase
        .from('User')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return null;
    }

    return data;
};
