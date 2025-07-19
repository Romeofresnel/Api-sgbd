import pool from "../config/db.js";

const createBilanTable = async () => {
    const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS bilan (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        periode VARCHAR(100) NOT NULL UNIQUE,
        date_debut DATE,
        date_fin DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`;

    try {
        const result = await pool.query(queryText);
        console.log('Table bilan créée avec succès');
        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la table bilan:', error.message);
        throw error;
    }
}

export default createBilanTable;