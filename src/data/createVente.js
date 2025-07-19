import pool from "../config/db.js";

const createVenteTable = async () => {
    const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS vente (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        dates DATE NOT NULL,
        produit_id UUID REFERENCES produit(id) ON DELETE CASCADE,
        client_id UUID REFERENCES client(id) ON DELETE CASCADE,
        quantite INTEGER NOT NULL CHECK (quantite > 0),
        prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire >= 0),
        montant_total DECIMAL(10,2) NOT NULL CHECK (montant_total >= 0),
        mode_paiement VARCHAR(50) NOT NULL CHECK (mode_paiement IN ('especes', 'carte', 'cheque', 'virement', 'mobile_money')),
        statut VARCHAR(30) DEFAULT 'completee' CHECK (statut IN ('en_cours', 'completee', 'annulee', 'remboursee')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    try {
        const result = await pool.query(queryText);
        console.log('Table vente créée avec succès');
        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la table vente:', error.message);
        throw error;
    }
}

export default createVenteTable;