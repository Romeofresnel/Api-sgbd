import pkg from "pg"
import dotenv from "dotenv"
dotenv.config()

const { Pool } = pkg

const pool = new Pool({
    user: String(process.env.DB_USER || 'root'),
    host: String(process.env.DB_HOST),
    database: String(process.env.DB_NAME || 'sgbdproject'),
    password: String(process.env.DB_PASSWORD),
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("connexion pool etablie avec la base de donnees");
})

export default pool