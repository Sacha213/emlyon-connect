import { Router } from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/event.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @route   GET /api/events
 * @desc    Récupérer tous les événements à venir
 * @access  Private
 */
router.get('/', eventController.getAllEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Récupérer un événement par son ID
 * @access  Private
 */
router.get('/:id', eventController.getEventById);

/**
 * @route   POST /api/events
 * @desc    Créer un nouvel événement
 * @access  Private
 */
router.post(
  '/',
  [
    body('title').notEmpty().trim().withMessage('Le titre est requis'),
    body('description').notEmpty().trim().withMessage('La description est requise'),
    body('date').isISO8601().withMessage('Date invalide'),
    validate
  ],
  eventController.createEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Mettre à jour un événement
 * @access  Private (créateur uniquement)
 */
router.put('/:id', eventController.updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Supprimer un événement
 * @access  Private (créateur uniquement)
 */
router.delete('/:id', eventController.deleteEvent);

/**
 * @route   POST /api/events/:id/attend
 * @desc    Participer à un événement
 * @access  Private
 */
router.post('/:id/attend', eventController.attendEvent);

/**
 * @route   DELETE /api/events/:id/attend
 * @desc    Se désinscrire d'un événement
 * @access  Private
 */
router.delete('/:id/attend', eventController.unattendEvent);

export default router;
