import pkg from "pg"
import dotenv from "dotenv"
dotenv.config()

const { Pool } = pkg

console.log("🔧 Configuration DB:", {
    user: String(process.env.DB_USER || 'sgbdproject_user'),
    host: String(process.env.DB_HOST),
    database: String(process.env.DB_NAME || 'sgbdproject'),
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: 'activé'
    // ⚠️ NE LOGGEZ PAS le mot de passe !
});

const pool = new Pool({
    user: String(process.env.DB_USER || 'sgbdproject_user'),
    host: String(process.env.DB_HOST),
    database: String(process.env.DB_NAME || 'sgbdproject'),
    password: String(process.env.DB_PASSWORD),
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
        rejectUnauthorized: false
    },
    // Ajoutez ces paramètres de timeout
    connectionTimeoutMillis: 10000, // 10 secondes max pour la connexion
    idleTimeoutMillis: 30000,
});

// Test de connexion immédiat
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ ÉCHEC DE CONNEXION DÉTAILLÉ:", {
            message: err.message,
            code: err.code,  // ← Code PostgreSQL très important !
            stack: err.stack
        });
        return;
    }
    console.log("✅ Connexion DB réussie !");
    release();
});

pool.on("connect", () => {
    console.log("✅ Pool connecté avec succès");
});

pool.on("error", (err) => {
    console.error("❌ Erreur du pool:", err.message, "Code:", err.code);
});

export default pool
