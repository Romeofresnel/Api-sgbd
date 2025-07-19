import pool from "../config/db.js";

const createClientTable = async () => {
    const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS client (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nom VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    try {
        const result = await pool.query(queryText);
        console.log('Table client créée avec succès');
        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la table client:', error.message);
        throw error;
    }
}

export default createClientTable;