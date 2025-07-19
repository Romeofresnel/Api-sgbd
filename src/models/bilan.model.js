import pool from "../config/db.js";

/**
 * Services pour la gestion du bilan financier avec gestion des plages de dates
 * Formats de période supportés :
 * - "2025-01" (mois entier)
 * - "2025" (année entière)  
 * - "07/06/2025-18/06/2025" (plage de dates spécifique)
 * - "2025-06-07_2025-06-18" (format alternatif)
 * 
 * total_achat = somme des (prix_achat * quantité) des produits vendus
 * total_vente = somme des montants des ventes de la période
 * bénéfice = total_vente - total_achat
 */

// Fonction utilitaire pour parser la période et créer la condition WHERE
const parsePeriodToDateCondition = (periode) => {
    // Format : "07/06/2025-18/06/2025" ou "2025-06-07_2025-06-18"
    if (periode.includes('-') && (periode.includes('/') || periode.split('-').length > 3)) {
        let dateDebut, dateFin;

        if (periode.includes('/')) {
            // Format: "07/06/2025-18/06/2025"
            const [debut, fin] = periode.split('-');
            const [jourD, moisD, anneeD] = debut.split('/');
            const [jourF, moisF, anneeF] = fin.split('/');
            dateDebut = `${anneeD}-${moisD.padStart(2, '0')}-${jourD.padStart(2, '0')}`;
            dateFin = `${anneeF}-${moisF.padStart(2, '0')}-${jourF.padStart(2, '0')}`;
        } else {
            // Format: "2025-06-07_2025-06-18"
            [dateDebut, dateFin] = periode.split('_');
        }

        return {
            condition: "DATE(v.date_vente) BETWEEN $1 AND $2",
            params: [dateDebut, dateFin],
            type: 'plage'
        };
    }

    // Format mois : "2025-01"
    if (periode.match(/^\d{4}-\d{2}$/)) {
        return {
            condition: "TO_CHAR(v.date_vente, 'YYYY-MM') = $1",
            params: [periode],
            type: 'mois'
        };
    }

    // Format année : "2025"
    if (periode.match(/^\d{4}$/)) {
        return {
            condition: "EXTRACT(YEAR FROM v.date_vente) = $1",
            params: [parseInt(periode)],
            type: 'annee'
        };
    }

    // Période exacte (pour compatibilité)
    return {
        condition: "v.periode = $1",
        params: [periode],
        type: 'exacte'
    };
};

// Récupérer tous les bilans avec calculs automatiques
export const getAllBilanServices = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                b.id, 
                b.periode,
                b.date_debut,
                b.date_fin,
                COALESCE(totaux.total_vente, 0) as total_vente,
                COALESCE(totaux.total_achat, 0) as total_achat,
                (COALESCE(totaux.total_vente, 0) - COALESCE(totaux.total_achat, 0)) as benefice,
                b.created_at,
                b.updated_at
            FROM bilan b
            LEFT JOIN LATERAL (
                SELECT 
                    SUM(v.montant_total) as total_vente,
                    SUM(p.prix_achat * vp.quantite) as total_achat
                FROM ventes v
                LEFT JOIN vente_produits vp ON vp.vente_id = v.id
                LEFT JOIN produits p ON p.id = vp.produit_id
                WHERE (
                    (b.date_debut IS NOT NULL AND b.date_fin IS NOT NULL AND DATE(v.date_vente) BETWEEN b.date_debut AND b.date_fin)
                    OR (b.date_debut IS NULL AND b.date_fin IS NULL AND v.periode = b.periode)
                )
            ) totaux ON true
            ORDER BY b.created_at DESC
        `);
        return result.rows;
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des bilans: ${error.message}`);
    }
};

// Récupérer un bilan spécifique avec calculs automatiques
export const getOneBilanServices = async (id) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.id, 
                b.periode,
                b.date_debut,
                b.date_fin,
                COALESCE(totaux.total_vente, 0) as total_vente,
                COALESCE(totaux.total_achat, 0) as total_achat,
                (COALESCE(totaux.total_vente, 0) - COALESCE(totaux.total_achat, 0)) as benefice,
                b.created_at,
                b.updated_at
            FROM bilan b
            LEFT JOIN LATERAL (
                SELECT 
                    SUM(v.montant_total) as total_vente,
                    SUM(p.prix_achat * vp.quantite) as total_achat
                FROM ventes v
                LEFT JOIN vente_produits vp ON vp.vente_id = v.id
                LEFT JOIN produits p ON p.id = vp.produit_id
                WHERE (
                    (b.date_debut IS NOT NULL AND b.date_fin IS NOT NULL AND DATE(v.date_vente) BETWEEN b.date_debut AND b.date_fin)
                    OR (b.date_debut IS NULL AND b.date_fin IS NULL AND v.periode = b.periode)
                )
            ) totaux ON true
            WHERE b.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            throw new Error('Bilan non trouvé');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la récupération du bilan: ${error.message}`);
    }
};

// Calculer les totaux pour une période donnée (avec support des plages de dates)
export const calculatePeriodTotalsServices = async (periode) => {
    try {
        const periodInfo = parsePeriodToDateCondition(periode);

        let query = `
            SELECT 
                $${periodInfo.params.length + 1} as periode,
                COALESCE(SUM(v.montant_total), 0) as total_vente,
                COALESCE(SUM(p.prix_achat * vp.quantite), 0) as total_achat,
                (COALESCE(SUM(v.montant_total), 0) - COALESCE(SUM(p.prix_achat * vp.quantite), 0)) as benefice,
                COUNT(DISTINCT v.id) as nombre_ventes,
                COUNT(DISTINCT p.id) as nombre_produits_vendus,
                MIN(DATE(v.date_vente)) as premiere_vente,
                MAX(DATE(v.date_vente)) as derniere_vente
            FROM ventes v
            LEFT JOIN vente_produits vp ON vp.vente_id = v.id
            LEFT JOIN produits p ON p.id = vp.produit_id
            WHERE ${periodInfo.condition}
        `;

        const params = [...periodInfo.params, periode];
        const result = await pool.query(query, params);

        return {
            ...result.rows[0],
            type_periode: periodInfo.type
        };
    } catch (error) {
        throw new Error(`Erreur lors du calcul des totaux: ${error.message}`);
    }
};

// Créer un nouveau bilan (calcul automatique des totaux avec support des plages)
export const newBilanServices = async (periode) => {
    try {
        // Validation de la période
        if (!periode) {
            throw new Error('La période est requise');
        }

        // Vérifier si un bilan existe déjà pour cette période
        const existingBilan = await pool.query(
            "SELECT id FROM bilan WHERE periode = $1",
            [periode]
        );

        if (existingBilan.rows.length > 0) {
            throw new Error('Un bilan existe déjà pour cette période');
        }

        // Calculer les totaux et vérifier s'il y a des données
        const periodData = await calculatePeriodTotalsServices(periode);

        if (periodData.nombre_ventes === 0) {
            throw new Error('Aucune vente trouvée pour cette période');
        }

        // Parser la période pour extraire les dates si c'est une plage
        const periodInfo = parsePeriodToDateCondition(periode);
        let dateDebut = null, dateFin = null;

        if (periodInfo.type === 'plage') {
            [dateDebut, dateFin] = periodInfo.params;
        }

        // Créer le bilan
        const result = await pool.query(`
            INSERT INTO bilan (periode, date_debut, date_fin, created_at, updated_at) 
            VALUES ($1, $2, $3, NOW(), NOW()) 
            RETURNING id, periode, date_debut, date_fin, created_at, updated_at
        `, [periode, dateDebut, dateFin]);

        const bilanId = result.rows[0].id;

        // Retourner le bilan avec les totaux calculés
        return await getOneBilanServices(bilanId);
    } catch (error) {
        throw new Error(`Erreur lors de la création du bilan: ${error.message}`);
    }
};

// Mettre à jour un bilan existant
export const updateBilanServices = async (id, nouvelle_periode) => {
    try {
        // Validation de la période
        if (!nouvelle_periode) {
            throw new Error('La nouvelle période est requise');
        }

        // Vérifier si le bilan existe
        const existingBilan = await pool.query("SELECT periode FROM bilan WHERE id = $1", [id]);
        if (existingBilan.rows.length === 0) {
            throw new Error('Bilan non trouvé');
        }

        // Vérifier si la nouvelle période n'est pas déjà utilisée par un autre bilan
        const duplicatePeriod = await pool.query(
            "SELECT id FROM bilan WHERE periode = $1 AND id != $2",
            [nouvelle_periode, id]
        );

        if (duplicatePeriod.rows.length > 0) {
            throw new Error('Un autre bilan existe déjà pour cette période');
        }

        // Vérifier s'il y a des données pour la nouvelle période
        const periodData = await calculatePeriodTotalsServices(nouvelle_periode);

        if (periodData.nombre_ventes === 0) {
            throw new Error('Aucune vente trouvée pour cette nouvelle période');
        }

        // Parser la nouvelle période pour extraire les dates si c'est une plage
        const periodInfo = parsePeriodToDateCondition(nouvelle_periode);
        let dateDebut = null, dateFin = null;

        if (periodInfo.type === 'plage') {
            [dateDebut, dateFin] = periodInfo.params;
        }

        // Mettre à jour la période et les dates
        await pool.query(`
            UPDATE bilan 
            SET periode = $1, date_debut = $2, date_fin = $3, updated_at = NOW() 
            WHERE id = $4
        `, [nouvelle_periode, dateDebut, dateFin, id]);

        // Retourner le bilan avec les nouveaux totaux calculés
        return await getOneBilanServices(id);
    } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du bilan: ${error.message}`);
    }
};

// Recalculer un bilan existant
export const recalculateBilanServices = async (id) => {
    try {
        const bilan = await pool.query("SELECT periode FROM bilan WHERE id = $1", [id]);
        if (bilan.rows.length === 0) {
            throw new Error('Bilan non trouvé');
        }

        // Mettre à jour le timestamp
        await pool.query("UPDATE bilan SET updated_at = NOW() WHERE id = $1", [id]);

        // Retourner le bilan avec les totaux recalculés
        return await getOneBilanServices(id);
    } catch (error) {
        throw new Error(`Erreur lors du recalcul du bilan: ${error.message}`);
    }
};

// Supprimer un bilan
export const deleteBilanServices = async (id) => {
    try {
        const result = await pool.query(`
            DELETE FROM bilan 
            WHERE id = $1 
            RETURNING id, periode, date_debut, date_fin
        `, [id]);

        if (result.rows.length === 0) {
            throw new Error('Bilan non trouvé');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la suppression du bilan: ${error.message}`);
    }
};

// Obtenir les détails des ventes pour une période avec support des plages
export const getVentesDetailsByPeriodServices = async (periode) => {
    try {
        const periodInfo = parsePeriodToDateCondition(periode);

        const query = `
            SELECT 
                v.id as vente_id,
                v.date_vente,
                v.montant_total,
                p.nom as produit_nom,
                p.prix_achat,
                p.prix_vente,
                vp.quantite,
                (p.prix_achat * vp.quantite) as cout_achat_produit,
                (p.prix_vente * vp.quantite) as montant_vente_produit
            FROM ventes v
            JOIN vente_produits vp ON vp.vente_id = v.id
            JOIN produits p ON p.id = vp.produit_id
            WHERE ${periodInfo.condition}
            ORDER BY v.date_vente DESC, p.nom
        `;

        const result = await pool.query(query, periodInfo.params);
        return result.rows;
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des détails: ${error.message}`);
    }
};

// Fonction pour obtenir les bilans d'une période spécifique
export const getBilanByPeriodServices = async (searchPeriod) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.id, 
                b.periode,
                b.date_debut,
                b.date_fin,
                COALESCE(totaux.total_vente, 0) as total_vente,
                COALESCE(totaux.total_achat, 0) as total_achat,
                (COALESCE(totaux.total_vente, 0) - COALESCE(totaux.total_achat, 0)) as benefice,
                b.created_at,
                b.updated_at
            FROM bilan b
            LEFT JOIN LATERAL (
                SELECT 
                    SUM(v.montant_total) as total_vente,
                    SUM(p.prix_achat * vp.quantite) as total_achat
                FROM ventes v
                LEFT JOIN vente_produits vp ON vp.vente_id = v.id
                LEFT JOIN produits p ON p.id = vp.produit_id
                WHERE (
                    (b.date_debut IS NOT NULL AND b.date_fin IS NOT NULL AND DATE(v.date_vente) BETWEEN b.date_debut AND b.date_fin)
                    OR (b.date_debut IS NULL AND b.date_fin IS NULL AND v.periode = b.periode)
                )
            ) totaux ON true
            WHERE b.periode ILIKE $1
            ORDER BY b.created_at DESC
        `, [`%${searchPeriod}%`]);

        return result.rows;
    } catch (error) {
        throw new Error(`Erreur lors de la recherche par période: ${error.message}`);
    }
};

// Fonction pour créer un bilan pour une plage de dates spécifique (helper)
export const createBilanForDateRangeServices = async (dateDebut, dateFin, libelle = null) => {
    try {
        // Convertir les dates au format attendu
        const formatDate = (date) => {
            if (date.includes('/')) {
                const [jour, mois, annee] = date.split('/');
                return `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
            }
            return date;
        };

        const dateDebutFormatted = formatDate(dateDebut);
        const dateFinFormatted = formatDate(dateFin);

        // Créer la période au format : "07/06/2025-18/06/2025"
        const periode = libelle || `${dateDebut}-${dateFin}`;

        return await newBilanServices(periode);
    } catch (error) {
        throw new Error(`Erreur lors de la création du bilan pour la plage: ${error.message}`);
    }
};

// Fonction pour obtenir les statistiques globales
export const getBilanStatsServices = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(DISTINCT b.id) as total_bilans,
                SUM(COALESCE(totaux.total_vente, 0)) as total_ventes_global,
                SUM(COALESCE(totaux.total_achat, 0)) as total_achats_global,
                (SUM(COALESCE(totaux.total_vente, 0)) - SUM(COALESCE(totaux.total_achat, 0))) as benefice_global
            FROM bilan b
            LEFT JOIN LATERAL (
                SELECT 
                    SUM(v.montant_total) as total_vente,
                    SUM(p.prix_achat * vp.quantite) as total_achat
                FROM ventes v
                LEFT JOIN vente_produits vp ON vp.vente_id = v.id
                LEFT JOIN produits p ON p.id = vp.produit_id
                WHERE (
                    (b.date_debut IS NOT NULL AND b.date_fin IS NOT NULL AND DATE(v.date_vente) BETWEEN b.date_debut AND b.date_fin)
                    OR (b.date_debut IS NULL AND b.date_fin IS NULL AND v.periode = b.periode)
                )
            ) totaux ON true
        `);

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
    }
};
