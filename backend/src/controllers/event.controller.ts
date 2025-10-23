import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { broadcastEvents } from '../websocket';
import { formatAvatarUrl } from '../utils/avatarUrl';

/**
 * Récupérer tous les événements à venir
 */
export const getAllEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Transformer les données pour correspondre au format frontend
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.getTime(),
      creator: {
        id: event.creator.id,
        name: event.creator.name,
        avatarUrl: formatAvatarUrl(event.creator.avatarUrl)
      },
      attendees: event.attendees.map(a => ({
        id: a.user.id,
        name: a.user.name,
        avatarUrl: formatAvatarUrl(a.user.avatarUrl)
      }))
    }));

    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un événement par son ID
 */
export const getEventById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      throw new CustomError('Événement introuvable', 404);
    }

    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.getTime(),
      creator: {
        id: event.creator.id,
        name: event.creator.name,
        avatarUrl: formatAvatarUrl(event.creator.avatarUrl)
      },
      attendees: event.attendees.map(a => ({
        id: a.user.id,
        name: a.user.name,
        avatarUrl: formatAvatarUrl(a.user.avatarUrl)
      }))
    };

    res.json({
      success: true,
      data: formattedEvent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouvel événement
 */
export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, date } = req.body;
    const userId = req.userId!;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        creatorId: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    // Le créateur participe automatiquement
    await prisma.eventAttendee.create({
      data: {
        eventId: event.id,
        userId
      }
    });

    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.getTime(),
      creator: {
        id: event.creator.id,
        name: event.creator.name,
        avatarUrl: event.creator.avatarUrl
      },
      attendees: [{
        id: event.creator.id,
        name: event.creator.name,
        avatarUrl: event.creator.avatarUrl
      }]
    };

    // Broadcast via WebSocket
    broadcastEvents();

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: formattedEvent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un événement
 */
export const updateEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    const userId = req.userId!;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw new CustomError('Événement introuvable', 404);
    }

    if (event.creatorId !== userId) {
      throw new CustomError('Non autorisé', 403);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(date && { date: new Date(date) })
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    const formattedEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      date: updatedEvent.date.getTime(),
      creator: {
        id: updatedEvent.creator.id,
        name: updatedEvent.creator.name,
        avatarUrl: updatedEvent.creator.avatarUrl
      },
      attendees: updatedEvent.attendees.map(a => ({
        id: a.user.id,
        name: a.user.name,
        avatarUrl: a.user.avatarUrl
      }))
    };

    // Broadcast via WebSocket
    broadcastEvents();

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: formattedEvent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un événement
 */
export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw new CustomError('Événement introuvable', 404);
    }

    if (event.creatorId !== userId) {
      throw new CustomError('Non autorisé', 403);
    }

    await prisma.event.delete({
      where: { id }
    });

    // Broadcast via WebSocket
    broadcastEvents();

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Participer à un événement
 */
export const attendEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw new CustomError('Événement introuvable', 404);
    }

    // Vérifier si déjà participant
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId
        }
      }
    });

    if (existingAttendee) {
      throw new CustomError('Vous participez déjà à cet événement', 400);
    }

    await prisma.eventAttendee.create({
      data: {
        eventId: id,
        userId
      }
    });

    // Broadcast via WebSocket
    broadcastEvents();

    res.json({
      success: true,
      message: 'Participation confirmée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Se désinscrire d'un événement
 */
export const unattendEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw new CustomError('Événement introuvable', 404);
    }

    // Le créateur ne peut pas se désinscrire
    if (event.creatorId === userId) {
      throw new CustomError('Le créateur ne peut pas se désinscrire', 400);
    }

    await prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId
        }
      }
    });

    // Broadcast via WebSocket
    broadcastEvents();

    res.json({
      success: true,
      message: 'Participation annulée'
    });
  } catch (error) {
    next(error);
  }
};
