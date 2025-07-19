import pool from "../config/db.js";

// Récupérer toutes les ventes avec les détails du produit et du client
export const getAllVenteServices = async () => {
    const result = await pool.query(`
        SELECT 
            v.id, 
            v.dates, 
            v.quantite, 
            v.client_id,
            v.montant_total,
            v.mode_paiement,
            v.produit_id,
            p.nom as produit_nom,
            p.prix_vente as produit_prix_vente,
            c.nom as client_nom,
            c.contact as client_contact
        FROM vente v
        LEFT JOIN produit p ON v.produit_id = p.id
        LEFT JOIN client c ON v.client_id = c.id
        ORDER BY v.dates DESC
    `);
    return result.rows;
}

// Récupérer une vente spécifique avec les détails du produit et du client
export const getOneVenteServices = async (id) => {
    const result = await pool.query(`
        SELECT 
            v.id, 
            v.dates, 
            v.quantite, 
            v.client_id,
            v.montant_total,
            v.mode_paiement,
            v.produit_id,
            p.nom as produit_nom,
            p.prix_vente as produit_prix_vente,
            c.nom as client_nom,
            c.contact as client_contact
        FROM vente v
        LEFT JOIN produit p ON v.produit_id = p.id
        LEFT JOIN client c ON v.client_id = c.id
        WHERE v.id = $1
    `, [id]);
    return result.rows[0];
}

// Créer une nouvelle vente
export const newVenteServices = async (dates, quantite, prix_unitaire, client_id, montant_total, mode_paiement, produit_id) => {
    // Commencer une transaction pour assurer la cohérence
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Vérifier que le produit existe et récupérer son stock
        const produitResult = await client.query("SELECT id, prix_vente, stock, nom FROM produit WHERE id = $1", [produit_id]);
        if (produitResult.rows.length === 0) {
            throw new Error(`Le produit avec l'ID ${produit_id} n'existe pas`);
        }

        const produit = produitResult.rows[0];
        const stockActuel = produit.stock;

        // Vérifier que le client existe
        const clientExists = await client.query("SELECT id FROM client WHERE id = $1", [client_id]);
        if (clientExists.rows.length === 0) {
            throw new Error(`Le client avec l'ID ${client_id} n'existe pas`);
        }

        // Validation des données
        if (quantite <= 0) {
            throw new Error("La quantité doit être supérieure à 0");
        }
        if (montant_total <= 0) {
            throw new Error("Le montant total doit être supérieur à 0");
        }

        // Vérifier si le stock est suffisant
        if (quantite > stockActuel) {
            throw new Error(`Quantité insuffisante. Stock disponible: ${stockActuel} pour le produit "${produit.nom}"`);
        }

        // Créer la vente
        const venteResult = await client.query(
            "INSERT INTO vente (dates, quantite, client_id, prix_unitaire, montant_total, mode_paiement, produit_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [dates, quantite, client_id, prix_unitaire, montant_total, mode_paiement, produit_id]
        );

        // Mettre à jour le stock du produit
        const nouveauStock = stockActuel - quantite;
        await client.query(
            "UPDATE produit SET stock = $1 WHERE id = $2",
            [nouveauStock, produit_id]
        );

        // Valider la transaction
        await client.query('COMMIT');

        return venteResult.rows[0];

    } catch (error) {
        // Annuler la transaction en cas d'erreur
        await client.query('ROLLBACK');
        throw error;
    } finally {
        // Libérer le client
        client.release();
    }
}

// Mettre à jour une vente
export const updateVenteServices = async (id, dates, quantite, prix_unitaire, client_id, montant_total, mode_paiement, produit_id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Récupérer les informations de la vente actuelle
        const venteActuelle = await client.query("SELECT * FROM vente WHERE id = $1", [id]);
        if (venteActuelle.rows.length === 0) {
            throw new Error(`Aucune vente trouvée avec l'ID ${id}`);
        }

        const ancienneVente = venteActuelle.rows[0];

        // Vérifier que le produit existe si produit_id est fourni
        if (produit_id) {
            const produitExists = await client.query("SELECT id, stock, nom FROM produit WHERE id = $1", [produit_id]);
            if (produitExists.rows.length === 0) {
                throw new Error(`Le produit avec l'ID ${produit_id} n'existe pas`);
            }
        }

        // Vérifier que le client existe si client_id est fourni
        if (client_id) {
            const clientExists = await client.query("SELECT id FROM client WHERE id = $1", [client_id]);
            if (clientExists.rows.length === 0) {
                throw new Error(`Le client avec l'ID ${client_id} n'existe pas`);
            }
        }

        // Validation des données
        if (quantite && quantite <= 0) {
            throw new Error("La quantité doit être supérieure à 0");
        }
        if (montant_total && montant_total <= 0) {
            throw new Error("Le montant total doit être supérieur à 0");
        }

        // Gérer la mise à jour du stock si la quantité ou le produit change
        if (quantite !== undefined || produit_id !== undefined) {
            const nouvelleQuantite = quantite || ancienneVente.quantite;
            const nouveauProduitId = produit_id || ancienneVente.produit_id;

            // Restaurer le stock de l'ancien produit
            await client.query(
                "UPDATE produit SET stock = stock + $1 WHERE id = $2",
                [ancienneVente.quantite, ancienneVente.produit_id]
            );

            // Vérifier le stock du nouveau produit
            const produitResult = await client.query("SELECT stock, nom FROM produit WHERE id = $1", [nouveauProduitId]);
            const stockDisponible = produitResult.rows[0].stock;

            if (nouvelleQuantite > stockDisponible) {
                throw new Error(`Quantité insuffisante. Stock disponible: ${stockDisponible} pour le produit "${produitResult.rows[0].nom}"`);
            }

            // Déduire la nouvelle quantité du stock du produit
            await client.query(
                "UPDATE produit SET stock = stock - $1 WHERE id = $2",
                [nouvelleQuantite, nouveauProduitId]
            );
        }

        // Mettre à jour la vente (correction de la syntaxe SQL)
        const result = await client.query(
            "UPDATE vente SET dates=$1, quantite=$2, client_id=$3, montant_total=$4, mode_paiement=$5, produit_id=$6, prix_unitaire=$7 WHERE id=$8 RETURNING *",
            [dates, quantite, client_id, montant_total, mode_paiement, produit_id, prix_unitaire, id]
        );

        await client.query('COMMIT');
        return result.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Supprimer une vente
export const deleteVenteServices = async (id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Récupérer les informations de la vente avant suppression
        const venteResult = await client.query("SELECT * FROM vente WHERE id = $1", [id]);
        if (venteResult.rows.length === 0) {
            throw new Error(`Aucune vente trouvée avec l'ID ${id}`);
        }

        const vente = venteResult.rows[0];

        // Restaurer le stock du produit
        await client.query(
            "UPDATE produit SET stock = stock + $1 WHERE id = $2",
            [vente.quantite, vente.produit_id]
        );

        // Supprimer la vente
        await client.query("DELETE FROM vente WHERE id = $1", [id]);

        await client.query('COMMIT');
        return vente;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Obtenir toutes les ventes d'un client spécifique
export const getVentesByClientServices = async (client_id) => {
    const result = await pool.query(`
        SELECT 
            v.id, 
            v.dates, 
            v.quantite, 
            v.montant_total,
            v.mode_paiement,
            p.nom as produit_nom,
            p.prix_vente as produit_prix_vente
        FROM vente v
        LEFT JOIN produit p ON v.produit_id = p.id
        WHERE v.client_id = $1
        ORDER BY v.dates DESC
    `, [client_id]);
    return result.rows;
}

// Obtenir toutes les ventes d'un produit spécifique
export const getVentesByProduitServices = async (produit_id) => {
    const result = await pool.query(`
        SELECT 
            v.id, 
            v.dates, 
            v.quantite, 
            v.montant_total,
            v.mode_paiement,
            c.nom as client_nom
        FROM vente v
        LEFT JOIN client c ON v.client_id = c.id
        WHERE v.produit_id = $1
        ORDER BY v.dates DESC
    `, [produit_id]);
    return result.rows;
}

// Obtenir les statistiques des ventes
export const getVentesStatsServices = async () => {
    const result = await pool.query(`
        SELECT 
            COUNT(*) as total_ventes,
            SUM(montant_total) as chiffre_affaires_total,
            AVG(montant_total) as montant_moyen,
            SUM(quantite) as quantite_totale_vendue
        FROM vente
    `);
    return result.rows[0];
}

// Obtenir les ventes par période (jour, mois, année)
export const getVentesByPeriodServices = async (startDate, endDate) => {
    const result = await pool.query(`
        SELECT 
            v.id, 
            v.dates, 
            v.quantite, 
            v.montant_total,
            v.mode_paiement,
            p.nom as produit_nom,
            c.nom as client_nom
        FROM vente v
        LEFT JOIN produit p ON v.produit_id = p.id
        LEFT JOIN client c ON v.client_id = c.id
        WHERE v.dates BETWEEN $1 AND $2
        ORDER BY v.dates DESC
    `, [startDate, endDate]);
    return result.rows;
}

// Calculer automatiquement le montant total basé sur le prix du produit et la quantité
export const calculateMontantTotal = async (produit_id, quantite) => {
    const result = await pool.query("SELECT prix_vente FROM produit WHERE id = $1", [produit_id]);

    if (result.rows.length === 0) {
        throw new Error(`Le produit avec l'ID ${produit_id} n'existe pas`);
    }

    const prix = result.rows[0].prix_vente;
    return prix * quantite;
}