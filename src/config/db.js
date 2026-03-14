import pkg from "pg"
import dotenv from "dotenv"
dotenv.config()

const { Pool } = pkg

// Utiliser DATABASE_URL si disponible, sinon les variables individuelles
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test de connexion
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Erreur de connexion:", err.message);
        return;
    }
    console.log("✅ Connecté à la base de données!");
    release();
});

export default pool
