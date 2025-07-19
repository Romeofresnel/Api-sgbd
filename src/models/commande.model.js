import pool from "../config/db.js";

export const getAllCommandeServices = async () => {
    const result = await pool.query(`
        SELECT 
            c.id,
            c.dates,
            c.quantite,
            c.produit_id,
            c.fournisseur_id,
            c.prix_unitaire,
            c.statut,
            p.nom as produit_nom,
            p.prix_vente as produit_prix_vente,
            f.nom as fournisseur_nom,
            f.email as fournisseur_email,
            f.telephone as fournisseur_telephone,
            f.adresse as fournisseur_adresse
        FROM commande c
        LEFT JOIN produit p ON c.produit_id = p.id
        LEFT JOIN fournisseur f ON c.fournisseur_id = f.id
        ORDER BY c.dates DESC
    `);
    return result.rows;
}

export const getOneCommandeServices = async (id) => {
    const result = await pool.query(`
        SELECT 
            c.id,
            c.dates,
            c.quantite,
            c.produit_id,
            c.fournisseur_id,
            p.nom as produit_nom,
            p.prix_vente as produit_prix_vente,
            f.nom as fournisseur_nom,
            f.email as fournisseur_email,
            f.telephone as fournisseur_telephone,
            f.adresse as fournisseur_adresse
            (c.quantite * p.prix_achat) as montant_total
        FROM commande c
        LEFT JOIN produit p ON c.produit_id = p.id
        LEFT JOIN fournisseur f ON c.fournisseur_id = f.id
        WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
        throw new Error(`Aucune commande trouvée avec l'ID ${id}`);
    }

    return result.rows[0];
}

export const getCommandesByProduitServices = async (produit_id) => {
    const result = await pool.query(`
        SELECT 
            c.*,
            p.nom as produit_nom,
            f.nom as fournisseur_nom
        FROM commande c
        LEFT JOIN produit p ON c.produit_id = p.id
        LEFT JOIN fournisseur f ON c.fournisseur_id = f.id
        WHERE c.produit_id = $1
        ORDER BY c.dates DESC
    `, [produit_id]);
    return result.rows;
}

export const getCommandesByFournisseurServices = async (fournisseur_id) => {
    const result = await pool.query(`
        SELECT 
            c.*,
            p.nom as produit_nom,
            f.nom as fournisseur_nom
        FROM commande c
        LEFT JOIN produit p ON c.produit_id = p.id
        LEFT JOIN fournisseur f ON c.fournisseur_id = f.id
        WHERE c.fournisseur_id = $1
        ORDER BY c.date DESC
    `, [fournisseur_id]);
    return result.rows;
}

export const newCommandeServices = async (dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id) => {
    // Validation des paramètres requis
    if (!produit_id || !quantite || !fournisseur_id) {
        throw new Error('Tous les champs sont requis :produit_id, quantite, fournisseur_id');
    }

    // // Vérifier que le produit existe
    // const produitExists = await pool.query("SELECT id, fournisseur_id FROM produit WHERE id = $1", [produit_id]);
    // if (produitExists.rows.length === 0) {
    //     throw new Error(`Le produit avec l'ID ${produit_id} n'existe pas`);
    // }

    // // Vérifier que le fournisseur existe
    // const fournisseurExists = await pool.query("SELECT id FROM fournisseur WHERE id = $1", [fournisseur_id]);
    // if (fournisseurExists.rows.length === 0) {
    //     throw new Error(`Le fournisseur avec l'ID ${fournisseur_id} n'existe pas`);
    // }

    // Vérifier que le produit appartient bien au fournisseur
    // const produit = produitExists.rows[0];
    // if (produit.fournisseur_id !== parseInt(fournisseur_id)) {
    //     throw new Error(`Le produit ${produit_id} n'appartient pas au fournisseur ${fournisseur_id}`);
    // }

    const result = await pool.query(
        "INSERT INTO commande (dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id) VALUES ($1, $2, $3, $4,$5,$6,$7) RETURNING *",
        [dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id]
    );
    return result.rows[0];
}

export const updateCommandeServices = async (dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id, id) => {
    // Vérifier que la commande existe
    // const commandeExists = await pool.query("SELECT id FROM commande WHERE id = $1", [id]);
    // if (commandeExists.rows.length === 0) {
    //     throw new Error(`Aucune commande trouvée avec l'ID ${id}`);
    // }

    // // Vérifier que le produit existe si produit_id est fourni
    // if (produit_id) {
    //     const produitExists = await pool.query("SELECT id, fournisseur_id FROM produit WHERE id = $1", [produit_id]);
    //     if (produitExists.rows.length === 0) {
    //         throw new Error(`Le produit avec l'ID ${produit_id} n'existe pas`);
    //     }

    //     // Si fournisseur_id est aussi fourni, vérifier la cohérence
    //     if (fournisseur_id) {
    //         const produit = produitExists.rows[0];
    //         if (produit.fournisseur_id !== parseInt(fournisseur_id)) {
    //             throw new Error(`Le produit ${produit_id} n'appartient pas au fournisseur ${fournisseur_id}`);
    //         }
    //     }
    // }

    // // Vérifier que le fournisseur existe si fournisseur_id est fourni
    // if (fournisseur_id) {
    //     const fournisseurExists = await pool.query("SELECT id FROM fournisseur WHERE id = $1", [fournisseur_id]);
    //     if (fournisseurExists.rows.length === 0) {
    //         throw new Error(`Le fournisseur avec l'ID ${fournisseur_id} n'existe pas`);
    //     }
    // }

    const result = await pool.query(
        `UPDATE commande 
         SET dates = COALESCE($1, dates),
             produit_id = COALESCE($2, produit_id),
             prix_unitaire = COALESCE($3, prix_unitaire),
             montant_total = COALESCE($4, montant_total),
             statut = COALESCE($5, statut),
             quantite = COALESCE($6, quantite),
             fournisseur_id = COALESCE($7, fournisseur_id)
         WHERE id = $8 
         RETURNING *`,
        [dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id, id]
    );

    return result.rows[0];
}

export const deleteCommandeServices = async (id) => {
    const result = await pool.query("DELETE FROM commande WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
        throw new Error(`Aucune commande trouvée avec l'ID ${id}`);
    }

    return result.rows[0];
}