import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { broadcastCheckIns } from '../websocket';
import { formatAvatarUrl } from '../utils/avatarUrl';

/**
 * Récupérer tous les check-ins actifs (dernières 24h)
 */
export const getAllCheckIns = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const checkIns = await prisma.checkIn.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            promotion: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour correspondre au format frontend
    const formattedCheckIns = checkIns.map(checkIn => ({
      id: checkIn.id,
      user: {
        id: checkIn.user.id,
        name: checkIn.user.name,
        avatarUrl: formatAvatarUrl(checkIn.user.avatarUrl),
        promotion: checkIn.user.promotion
      },
      locationName: checkIn.locationName,
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      timestamp: checkIn.createdAt.getTime(),
      statusEmoji: checkIn.statusEmoji
    }));

    res.json({
      success: true,
      data: formattedCheckIns
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau check-in
 */
export const createCheckIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationName, latitude, longitude, statusEmoji } = req.body;
    const userId = req.userId!;

    // Supprimer les anciens check-ins de l'utilisateur
    await prisma.checkIn.deleteMany({
      where: { userId }
    });

    // Créer le nouveau check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId,
        locationName,
        latitude,
        longitude,
        statusEmoji
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    const formattedCheckIn = {
      id: checkIn.id,
      user: {
        id: checkIn.user.id,
        name: checkIn.user.name,
        avatarUrl: checkIn.user.avatarUrl
      },
      locationName: checkIn.locationName,
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      timestamp: checkIn.createdAt.getTime(),
      statusEmoji: checkIn.statusEmoji
    };

    // Broadcast via WebSocket
    broadcastCheckIns();

    res.status(201).json({
      success: true,
      message: 'Check-in créé avec succès',
      data: formattedCheckIn
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un check-in
 */
export const deleteCheckIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const checkIn = await prisma.checkIn.findUnique({
      where: { id }
    });

    if (!checkIn) {
      throw new CustomError('Check-in introuvable', 404);
    }

    // Vérifier que c'est l'utilisateur qui a créé le check-in
    if (checkIn.userId !== userId) {
      throw new CustomError('Non autorisé', 403);
    }

    await prisma.checkIn.delete({
      where: { id }
    });

    // Broadcast via WebSocket
    broadcastCheckIns();

    res.json({
      success: true,
      message: 'Check-in supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer le check-in actif d'un utilisateur
 */
export const getUserCheckIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!checkIn) {
      return res.json({
        success: true,
        data: null
      });
    }

    const formattedCheckIn = {
      id: checkIn.id,
      user: {
        id: checkIn.user.id,
        name: checkIn.user.name,
        avatarUrl: checkIn.user.avatarUrl
      },
      locationName: checkIn.locationName,
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      timestamp: checkIn.createdAt.getTime(),
      statusEmoji: checkIn.statusEmoji
    };

    res.json({
      success: true,
      data: formattedCheckIn
    });
  } catch (error) {
    next(error);
  }
};
