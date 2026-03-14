import pkg from "pg"
import dotenv from "dotenv"
dotenv.config()

const { Pool } = pkg

// ⚠️ LOG DE DIAGNOSTIC CRITIQUE ⚠️
console.log("🔍 VARIABLES D'ENVIRONNEMENT:");
console.log("- DB_USER:", process.env.DB_USER || "non défini");
console.log("- DB_HOST:", process.env.DB_HOST || "non défini");
console.log("- DB_NAME:", process.env.DB_NAME || "non défini");
console.log("- DB_PORT:", process.env.DB_PORT || "non défini");
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "défini (caché)" : "non défini");
// ⚠️ NE LOGGEZ PAS LE MOT DE PASSE ! ⚠️

console.log("🔧 Configuration DB finale:", {
    user: process.env.DB_USER || "root",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || "sgbdproject",
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: "activé",
    usingURL: process.env.DATABASE_URL ? "oui" : "non"
});

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
