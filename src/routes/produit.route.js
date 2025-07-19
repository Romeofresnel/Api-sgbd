import express from "express";
import { deleteProduit, getAllProduit, getOneProduit, newProduit, updateProduit } from "../controllers/produit.controller.js";
import { getAllFournisseurByProduit } from "../controllers/fournisseur.controller.js";
import { getAllVenteByProduit } from "../controllers/vente.controller.js";
import { getAllCommandeByProduit } from "../controllers/commande.controller.js";

const router = express.Router();

router.get("/produit", getAllProduit);
router.get("/produit/:id", getOneProduit);
router.get("/produit/fournisseur/:id", getAllFournisseurByProduit);
router.get("/produit/commande/:id", getAllCommandeByProduit);
router.get("/produit/vente/:id", getAllVenteByProduit);
router.post("/produit/new", newProduit);
router.put("/produit/:id", updateProduit);
router.delete("/produit/:id", deleteProduit);

export default router;