import { supabase } from './supabaseClient';
import type { User, CheckIn, Event, Feedback, FeedbackComment } from '../types';

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

// ==================== FEEDBACKS ====================

export const getAllFeedbacks = async (): Promise<Feedback[]> => {
    const { data, error } = await supabase
        .from('Feedback')
        .select(`
      *,
      creator:User!Feedback_creatorId_fkey (
        id,
        name,
        avatarUrl,
        promotion
      ),
      comments:FeedbackComment (
        id,
        feedbackId,
        content,
        createdAt,
        user:User!FeedbackComment_userId_fkey (
          id,
          name,
          avatarUrl,
          promotion
        )
      )
    `)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Erreur lors du chargement des feedbacks:', error);
        return [];
    }

    return (data || []).map((feedback: any) => ({
        id: feedback.id,
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
        status: feedback.status,
        creator: feedback.creator,
        createdAt: new Date(feedback.createdAt + 'Z').getTime(),
        upvotes: feedback.upvotes || [],
        comments: (feedback.comments || []).map((comment: any) => ({
            id: comment.id,
            feedbackId: comment.feedbackId,
            user: comment.user,
            content: comment.content,
            createdAt: new Date(comment.createdAt + 'Z').getTime()
        }))
    }));
};

export const createFeedback = async (
    title: string,
    description: string,
    category: string,
    creatorId: string
): Promise<Feedback | null> => {
    const feedbackId = generateUUID();

    const { data, error } = await supabase
        .from('Feedback')
        .insert({
            id: feedbackId,
            title,
            description,
            category,
            status: 'pending',
            creatorId,
            upvotes: []
        })
        .select(`
      *,
      creator:User!Feedback_creatorId_fkey (
        id,
        name,
        avatarUrl,
        promotion
      )
    `)
        .single();

    if (error) {
        console.error('Erreur lors de la création du feedback:', error);
        return null;
    }

    return {
        ...data,
        createdAt: new Date(data.createdAt + 'Z').getTime(),
        comments: []
    };
};

export const upvoteFeedback = async (feedbackId: string, userId: string): Promise<boolean> => {
    // Récupérer le feedback actuel
    const { data: feedback, error: fetchError } = await supabase
        .from('Feedback')
        .select('upvotes')
        .eq('id', feedbackId)
        .single();

    if (fetchError) {
        console.error('Erreur lors de la récupération du feedback:', fetchError);
        return false;
    }

    const upvotes = feedback.upvotes || [];
    const hasUpvoted = upvotes.includes(userId);

    // Toggle upvote
    const newUpvotes = hasUpvoted
        ? upvotes.filter((id: string) => id !== userId)
        : [...upvotes, userId];

    const { error } = await supabase
        .from('Feedback')
        .update({ upvotes: newUpvotes })
        .eq('id', feedbackId);

    if (error) {
        console.error('Erreur lors du vote du feedback:', error);
        return false;
    }

    return true;
};

export const addFeedbackComment = async (
    feedbackId: string,
    userId: string,
    content: string
): Promise<FeedbackComment | null> => {
    const commentId = generateUUID();

    const { data, error } = await supabase
        .from('FeedbackComment')
        .insert({
            id: commentId,
            feedbackId,
            userId,
            content
        })
        .select(`
      *,
      user:User!FeedbackComment_userId_fkey (
        id,
        name,
        avatarUrl,
        promotion
      )
    `)
        .single();

    if (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        return null;
    }

    return {
        id: data.id,
        feedbackId: data.feedbackId,
        user: data.user,
        content: data.content,
        createdAt: new Date(data.createdAt + 'Z').getTime()
    };
};
