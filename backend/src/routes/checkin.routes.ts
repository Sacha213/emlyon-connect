import { Router } from 'express';
import { body } from 'express-validator';
import * as checkInController from '../controllers/checkin.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @route   GET /api/checkins
 * @desc    Récupérer tous les check-ins actifs (dernières 24h)
 * @access  Private
 */
router.get('/', checkInController.getAllCheckIns);

/**
 * @route   POST /api/checkins
 * @desc    Créer un nouveau check-in
 * @access  Private
 */
router.post(
  '/',
  [
    body('locationName').notEmpty().trim().withMessage('Le nom du lieu est requis'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide'),
    body('statusEmoji').optional().trim(),
    validate
  ],
  checkInController.createCheckIn
);

/**
 * @route   DELETE /api/checkins/:id
 * @desc    Supprimer un check-in
 * @access  Private
 */
router.delete('/:id', checkInController.deleteCheckIn);

/**
 * @route   GET /api/checkins/user/:userId
 * @desc    Récupérer le check-in actif d'un utilisateur
 * @access  Private
 */
router.get('/user/:userId', checkInController.getUserCheckIn);

export default router;
