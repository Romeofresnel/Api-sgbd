import express from 'express';
import {
    getAllBilan,
    getOneBilan,
    calculatePeriodTotals,
    createBilan,
    createBilanDateRange,
    updateBilan,
    recalculateBilan,
    deleteBilan,
    getVentesDetailsByPeriod,
    searchBilanByPeriod,
    getBilanStats,
    validatePeriodFormat
} from '../controllers/bilan.controller.js';

const router = express.Router();

/**
 * Routes pour la gestion des bilans financiers
 * Base URL: /api/bilans
 */

// Routes GET
// Récupérer tous les bilans
router.get('/', getAllBilan);

// Récupérer les statistiques globales
router.get('/stats', getBilanStats);

// Rechercher des bilans par période (query parameter)
router.get('/search', searchBilanByPeriod);

// Calculer les totaux pour une période sans créer de bilan
router.get('/calculate/:periode', validatePeriodFormat, calculatePeriodTotals);

// Obtenir les détails des ventes pour une période
router.get('/details/:periode', validatePeriodFormat, getVentesDetailsByPeriod);

// Récupérer un bilan spécifique par ID
router.get('/:id', getOneBilan);

// Routes POST
// Créer un nouveau bilan
router.post('/', validatePeriodFormat, createBilan);

// Créer un bilan pour une plage de dates spécifique
router.post('/date-range', createBilanDateRange);

// Routes PUT
// Mettre à jour un bilan existant
router.put('/:id', validatePeriodFormat, updateBilan);

// Recalculer un bilan existant
router.put('/:id/recalculate', recalculateBilan);

// Routes DELETE
// Supprimer un bilan
router.delete('/:id', deleteBilan);

export default router;