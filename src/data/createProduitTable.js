import pool from "../config/db.js";

const createProduitTable = async () => {
    const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS produit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    ref DECIMAL(10,2),
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2),
    stock DECIMAL(10,2),
    categorie VARCHAR(100),
    statut VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
    `;
    try {
        pool.query(queryText)
    } catch (error) {
        console.log(error.message);

    }
}

export default createProduitTable