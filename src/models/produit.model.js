import pool from "../config/db.js";

export const getAllProduitServices = async () => {
    const result = await pool.query("SELECT * FROM produit")
    return result.rows
}
export const getOneProduitServices = async (id) => {
    const result = await pool.query("SELECT * FROM produit where id = $1", [id])
    return result.rows[0]
}
export const newProduitServices = async (nom, ref, prix_achat, prix_vente, stock, categorie, statut) => {
    const result = await pool.query("INSERT INTO produit (nom, ref, prix_achat, prix_vente,stock, categorie, statut) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * ", [nom, ref, prix_achat, prix_vente, stock, categorie, statut])
    return result.rows[0]
}
export const updateProduitServices = async (id, nom, ref, prix_achat, prix_vente, stock, categorie, statut) => {
    const result = await pool.query("UPDATE produit SET nom=$1, ref=$2, prix_achat=$3, prix_vente=$4, stock=$5, categorie=$6, statut=$7 WHERE id=$8 RETURNING *", [nom, ref, prix_achat, prix_vente, stock, categorie, statut, id])
    return result.rows[0]
}
export const deleteProduitServices = async (id) => {
    const result = await pool.query("DELETE FROM produit WHERE id = $1 RETURNING *", [id])
    return result.rows[0]
}
