import pool from "../config/db.js";

const createCommandeTable = async () => {
    const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS commande (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        dates DATE ,
        produit_id UUID REFERENCES produit(id) ON DELETE CASCADE,
        fournisseur_id UUID REFERENCES fournisseur(id) ON DELETE CASCADE,
        quantite INTEGER NOT NULL CHECK (quantite > 0),
        prix_unitaire DECIMAL(10,2),
        montant_total DECIMAL(10,2),
        statut VARCHAR(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'livree', 'annulee')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    try {
        const result = await pool.query(queryText);
        console.log('Table commande créée avec succès');
        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la table commande:', error.message);
        throw error;
    }
}

export default createCommandeTable;