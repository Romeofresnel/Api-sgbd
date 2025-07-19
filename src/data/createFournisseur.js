import pool from "../config/db.js";

const createFournisseurTable = async () => {
    const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS fournisseur (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nom VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        adresse TEXT NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        produit_id UUID REFERENCES produit(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    try {
        const result = await pool.query(queryText);
        console.log('Table fournisseur créée avec succès');
        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la table fournisseur:', error.message);
        throw error;
    }
}

export default createFournisseurTable;