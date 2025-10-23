import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { uploadAvatar } from '../config/multer';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @route   GET /api/users/me
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', userController.getMe);

/**
 * @route   PUT /api/users/me
 * @desc    Mettre à jour le profil
 * @access  Private
 */
router.put(
    '/me',
    [
        body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
        validate
    ],
    userController.updateProfile
);

/**
 * @route   POST /api/users/me/avatar
 * @desc    Uploader/Mettre à jour la photo de profil
 * @access  Private
 */
router.post('/me/avatar', uploadAvatar.single('avatar'), userController.updateAvatar);

/**
 * @route   GET /api/users/:id
 * @desc    Récupérer un utilisateur par son ID
 * @access  Private
 */
router.get('/:id', userController.getUserById);

/**
 * @route   GET /api/users
 * @desc    Récupérer tous les utilisateurs
 * @access  Private
 */
router.get('/', userController.getAllUsers);

export default router;
