import pool from "../config/db.js";

export const getAllFournisseurServices = async () => {
    const result = await pool.query(`
        SELECT 
            f.id, 
            f.nom, 
            f.adresse, 
            f.email, 
            f.telephone, 
            f.produit_id,
            f.created_at,
            p.nom as produit_nom,
            p.prix_achat as produit_prix_achat
        FROM fournisseur f
        LEFT JOIN produit p ON f.produit_id = p.id
    `);
    return result.rows;
}
export const getOneFournisseurServices = async (id) => {
    const result = await pool.query(`
        SELECT 
            f.id, 
            f.nom, 
            f.adresse, 
            f.email, 
            f.telephone, 
            f.produit_id,
            p.nom as produit_nom,
            p.prix as produit_prix,
            p.description as produit_description
        FROM fournisseur f
        LEFT JOIN produit p ON f.produit_id = p.id
        WHERE f.id = $1
    `, [id]);
    return result.rows[0];
}
export const getFournisseursByProduitServices = async (produit_id) => {
    const result = await pool.query(
        "SELECT * FROM fournisseur WHERE produit_id = $1",
        [produit_id]
    );
    return result.rows;
}
export const newFournisseurServices = async (nom, adresse, email, telephone, produit_id) => {
    // Vérifier d'abord que le produit existe
    const produitExists = await pool.query("SELECT id FROM produit WHERE id = $1", [produit_id]);

    if (produitExists.rows.length === 0) {
        throw new Error(`Le produit avec l'ID ${produit_id} n'existe pas`);
    }

    const result = await pool.query(
        "INSERT INTO fournisseur (nom, adresse, email, telephone, produit_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [nom, adresse, email, telephone, produit_id]
    );
    return result.rows[0];
}
export const updateFournisseurServices = async (id, nom, adresse, email, telephone, produit_id) => {
    // Vérifier que le produit existe si produit_id est fourni
    if (produit_id) {
        const produitExists = await pool.query("SELECT id FROM produit WHERE id = $1", [produit_id]);
        if (produitExists.rows.length === 0) {
            throw new Error(`Le produit avec l'ID ${produit_id} n'existe pas`);
        }
    }

    const result = await pool.query(
        "UPDATE fournisseur SET nom=$1, adresse=$2, email=$3, telephone=$4, produit_id=$5 WHERE id=$6 RETURNING *",
        [nom, adresse, email, telephone, produit_id, id]
    );

    if (result.rows.length === 0) {
        throw new Error(`Aucun fournisseur trouvé avec l'ID ${id}`);
    }

    return result.rows[0];
}
export const deleteFournisseurServices = async (id) => {
    const result = await pool.query("DELETE FROM fournisseur WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
        throw new Error(`Aucun fournisseur trouvé avec l'ID ${id}`);
    }

    return result.rows[0];
}
