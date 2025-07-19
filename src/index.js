import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import produitRoutes from "./routes/produit.route.js"
import userRoutes from "./routes/user.route.js"
import fourRoutes from "./routes/fournisseur.route.js"
import venteRoutes from "./routes/vente.route.js"
import clientRoutes from "./routes/client.route.js"
import commandeRoutes from "./routes/commande.route.js"
import bilanRoutes from "./routes/bilan.route.js"

import pool from "./config/db.js"

import createProduitTable from "./data/createProduitTable.js"
import createUserTable from "./data/createUserTable.js"
import createFournisseurTable from "./data/createFournisseur.js"
import createVenteTable from "./data/createVente.js"
import createClientTable from "./data/createClient.js"
import createCommandeTable from "./data/createCommande.js"
import createBilanTable from "./data/createBilan.js"

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())
app.use(cors())

createProduitTable()
createUserTable()
createFournisseurTable()
createVenteTable()
createClientTable()
createCommandeTable()
createBilanTable()


app.use("/api/", produitRoutes, userRoutes, fourRoutes, venteRoutes, clientRoutes, commandeRoutes, bilanRoutes)
app.get("/", async (req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send(`le nom de la base de donnees est : ${result.rows[0].current_database}`)
})

app.listen(port, () => {
    console.log("le serveur est lancer et connecter au " + port);

})
