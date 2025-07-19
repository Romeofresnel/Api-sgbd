import {
    getAllBilanServices,
    getOneBilanServices,
    calculatePeriodTotalsServices,
    newBilanServices,
    updateBilanServices,
    recalculateBilanServices,
    deleteBilanServices,
    getVentesDetailsByPeriodServices,
    getBilanByPeriodServices,
    createBilanForDateRangeServices,
    getBilanStatsServices
} from "../models/bilan.model.js";

/**
 * Contrôleur pour la gestion des bilans financiers
 */

// Récupérer tous les bilans
export const getAllBilan = async (req, res) => {
    try {
        const bilans = await getAllBilanServices();
        res.status(200).json({
            success: true,
            message: "Bilans récupérés avec succès",
            data: bilans,
            count: bilans.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des bilans",
            error: error.message
        });
    }
};

// Récupérer un bilan spécifique
export const getOneBilan = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID du bilan invalide"
            });
        }

        const bilan = await getOneBilanServices(parseInt(id));
        res.status(200).json({
            success: true,
            message: "Bilan récupéré avec succès",
            data: bilan
        });
    } catch (error) {
        const statusCode = error.message.includes('non trouvé') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Calculer les totaux pour une période
export const calculatePeriodTotals = async (req, res) => {
    try {
        const { periode } = req.params;

        if (!periode) {
            return res.status(400).json({
                success: false,
                message: "La période est requise"
            });
        }

        const totals = await calculatePeriodTotalsServices(periode);
        res.status(200).json({
            success: true,
            message: "Totaux calculés avec succès",
            data: totals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Créer un nouveau bilan
export const createBilan = async (req, res) => {
    try {
        const { periode } = req.body;

        if (!periode) {
            return res.status(400).json({
                success: false,
                message: "La période est requise"
            });
        }

        const nouveauBilan = await newBilanServices(periode);
        res.status(201).json({
            success: true,
            message: "Bilan créé avec succès",
            data: nouveauBilan
        });
    } catch (error) {
        console.log(error.message);

    }
};

// Créer un bilan pour une plage de dates
export const createBilanDateRange = async (req, res) => {
    try {
        const { dateDebut, dateFin, libelle } = req.body;

        if (!dateDebut || !dateFin) {
            return res.status(400).json({
                success: false,
                message: "Les dates de début et de fin sont requises"
            });
        }

        const nouveauBilan = await createBilanForDateRangeServices(dateDebut, dateFin, libelle);
        res.status(201).json({
            success: true,
            message: "Bilan créé avec succès pour la plage de dates",
            data: nouveauBilan
        });
    } catch (error) {
        const statusCode = error.message.includes('existe déjà') ||
            error.message.includes('Aucune vente') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Mettre à jour un bilan
export const updateBilan = async (req, res) => {
    try {
        const { id } = req.params;
        const { periode } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID du bilan invalide"
            });
        }

        if (!periode) {
            return res.status(400).json({
                success: false,
                message: "La nouvelle période est requise"
            });
        }

        const bilanMisAJour = await updateBilanServices(parseInt(id), periode);
        res.status(200).json({
            success: true,
            message: "Bilan mis à jour avec succès",
            data: bilanMisAJour
        });
    } catch (error) {
        let statusCode = 500;
        if (error.message.includes('non trouvé')) statusCode = 404;
        if (error.message.includes('existe déjà') || error.message.includes('Aucune vente')) statusCode = 400;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Recalculer un bilan
export const recalculateBilan = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID du bilan invalide"
            });
        }

        const bilanRecalcule = await recalculateBilanServices(parseInt(id));
        res.status(200).json({
            success: true,
            message: "Bilan recalculé avec succès",
            data: bilanRecalcule
        });
    } catch (error) {
        const statusCode = error.message.includes('non trouvé') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Supprimer un bilan
export const deleteBilan = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID du bilan invalide"
            });
        }

        const bilanSupprime = await deleteBilanServices(parseInt(id));
        res.status(200).json({
            success: true,
            message: "Bilan supprimé avec succès",
            data: bilanSupprime
        });
    } catch (error) {
        const statusCode = error.message.includes('non trouvé') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// Obtenir les détails des ventes pour une période
export const getVentesDetailsByPeriod = async (req, res) => {
    try {
        const { periode } = req.params;

        if (!periode) {
            return res.status(400).json({
                success: false,
                message: "La période est requise"
            });
        }

        const details = await getVentesDetailsByPeriodServices(periode);
        res.status(200).json({
            success: true,
            message: "Détails des ventes récupérés avec succès",
            data: details,
            count: details.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Rechercher des bilans par période
export const searchBilanByPeriod = async (req, res) => {
    try {
        const { periode } = req.query;

        if (!periode) {
            return res.status(400).json({
                success: false,
                message: "Le paramètre de recherche 'periode' est requis"
            });
        }

        const bilans = await getBilanByPeriodServices(periode);
        res.status(200).json({
            success: true,
            message: `Bilans trouvés pour la recherche: ${periode}`,
            data: bilans,
            count: bilans.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtenir les statistiques globales
export const getBilanStats = async (req, res) => {
    try {
        const stats = await getBilanStatsServices();
        res.status(200).json({
            success: true,
            message: "Statistiques récupérées avec succès",
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Middleware de validation pour les formats de période
export const validatePeriodFormat = (req, res, next) => {
    const { periode } = req.body || req.params;

    if (!periode) {
        return next();
    }

    const formats = [
        /^\d{4}$/, // Format année: "2025"
        /^\d{4}-\d{2}$/, // Format mois: "2025-01"
        /^\d{2}\/\d{2}\/\d{4}-\d{2}\/\d{2}\/\d{4}$/, // Format plage: "07/06/2025-18/06/2025"
        /^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/ // Format alternatif: "2025-06-07_2025-06-18"
    ];

    const isValidFormat = formats.some(format => format.test(periode));

    if (!isValidFormat) {
        return res.status(400).json({
            success: false,
            message: "Format de période invalide. Formats acceptés: '2025', '2025-01', '07/06/2025-18/06/2025', '2025-06-07_2025-06-18'"
        });
    }

    next();
};