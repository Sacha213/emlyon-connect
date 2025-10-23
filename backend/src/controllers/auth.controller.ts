import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, avatarUrl, promotion } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new CustomError('Cet email est déjà utilisé', 400);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        promotion: promotion || 'EMI',
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      },
      select: {
        id: true,
        email: true,
        name: true,
        promotion: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Transformer l'avatarUrl en URL complète si c'est un chemin local
    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
      user.avatarUrl = `http://localhost:3001${user.avatarUrl}`;
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new CustomError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError('Email ou mot de passe incorrect', 401);
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Retourner les infos sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // Transformer l'avatarUrl en URL complète si c'est un chemin local
    if (userWithoutPassword.avatarUrl && userWithoutPassword.avatarUrl.startsWith('/uploads/')) {
      userWithoutPassword.avatarUrl = `http://localhost:3001${userWithoutPassword.avatarUrl}`;
    }

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};
