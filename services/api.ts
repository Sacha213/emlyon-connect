import { supabase } from './supabaseClient';
import type { User, CheckIn, Event, EventPollOption, Feedback, FeedbackComment } from '../types';

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
            latitude: typeof checkIn.latitude === 'number' ? checkIn.latitude : null,
            longitude: typeof checkIn.longitude === 'number' ? checkIn.longitude : null,
            timestamp,
            statusEmoji: checkIn.statusEmoji
        };
    });
};

export const createCheckIn = async (
    userId: string,
    locationName: string,
    coords: { latitude: number; longitude: number } | null,
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
            latitude: coords ? coords.latitude : null,
            longitude: coords ? coords.longitude : null,
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
        latitude: typeof data.latitude === 'number' ? data.latitude : null,
        longitude: typeof data.longitude === 'number' ? data.longitude : null,
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

export const updateCheckInStatus = async (checkInId: string, statusEmoji: string): Promise<boolean> => {
    const { error } = await supabase
        .from('CheckIn')
        .update({ statusEmoji })
        .eq('id', checkInId);

    if (error) {
        console.error('Erreur lors de la mise à jour du statut du check-in:', error);
        return false;
    }

    console.log('✅ Statut du check-in mis à jour:', checkInId, statusEmoji);
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

    return (data || []).map((event: any) => {
        const rawDate = event.date ? new Date(event.date + 'Z').getTime() : null;

        const pollOptions: EventPollOption[] | undefined = Array.isArray(event.pollOptions)
            ? event.pollOptions.map((option: any) => ({
                id: option.id,
                label: option.label,
                votes: Array.isArray(option.votes) ? option.votes : [],
                date: typeof option.date === 'number'
                    ? option.date
                    : option.date
                        ? new Date(option.date).getTime()
                        : null,
                location: option.location ?? null
            }))
            : undefined;

        return {
            id: event.id,
            title: event.title,
            description: event.description,
            date: rawDate,
            creator: event.creator,
            attendees: event.attendees.map((a: any) => a.user),
            category: event.category,
            pollType: event.pollType ?? null,
            pollOptions,
            selectedPollOptionId: event.selectedPollOptionId ?? null,
            pollClosesAt: event.pollClosesAt ? new Date(event.pollClosesAt + 'Z').getTime() : null
        };
    });
};

export const createEvent = async (
    userId: string,
    title: string,
    description: string,
    date: number | null,
    category?: string,
    options?: EventPollOption[] | null,
    pollType?: 'date' | 'location',
    pollClosesAt?: number | null
): Promise<Event | null> => {
    const eventId = generateUUID();
    const hasPoll = Array.isArray(options) && options.length > 0;

    const insertPayload: Record<string, any> = {
        id: eventId,
        title,
        description,
        date: date ? new Date(date).toISOString() : null,
        creatorId: userId,
        category: category || '🎉 Autre'
    };

    let pollOptions: EventPollOption[] | null = null;

    if (hasPoll) {
        pollOptions = options!.map(option => ({
            ...option,
            votes: option.votes ?? []
        }));

        insertPayload.pollOptions = pollOptions;
        insertPayload.pollType = pollType ?? null;
        insertPayload.pollClosesAt = pollClosesAt ? new Date(pollClosesAt).toISOString() : null;
        insertPayload.selectedPollOptionId = null;
    }

    const { data: eventData, error: eventError } = await supabase
        .from('Event')
        .insert(insertPayload)
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
        if (hasPoll && eventError.code === '42703') {
            throw Object.assign(new Error('MISSING_POLL_COLUMNS'), { code: 'MISSING_POLL_COLUMNS' });
        }
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
        date: eventData.date ? new Date(eventData.date + 'Z').getTime() : null,
        creator: eventData.creator,
        attendees: [eventData.creator],
        category: eventData.category,
        pollType: eventData.pollType ?? null,
        pollOptions: pollOptions ?? undefined,
        selectedPollOptionId: null,
        pollClosesAt: pollClosesAt ?? null
    };
};

export const voteEventPollOption = async (
    eventId: string,
    optionId: string,
    userId: string
): Promise<boolean> => {
    const { data, error } = await supabase
        .from('Event')
        .select('pollOptions')
        .eq('id', eventId)
        .single();

    if (error) {
        console.error('Erreur lors de la récupération du sondage:', error);
        return false;
    }

    const options: EventPollOption[] = Array.isArray(data?.pollOptions) ? data.pollOptions : [];
    if (options.length === 0) {
        return false;
    }

    const updated = options.map(option => ({
        ...option,
        votes: (option.votes || []).filter((id: string) => id !== userId)
    }));

    const target = updated.find(option => option.id === optionId);
    if (!target) {
        return false;
    }

    target.votes = Array.from(new Set([...(target.votes || []), userId]));

    const { error: updateError } = await supabase
        .from('Event')
        .update({ pollOptions: updated })
        .eq('id', eventId);

    if (updateError) {
        console.error('Erreur lors de la mise à jour du sondage:', updateError);
        return false;
    }

    return true;
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
