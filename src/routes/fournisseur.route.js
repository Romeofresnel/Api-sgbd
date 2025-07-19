import express from "express";
import { deleteFournisseur, getAllFournisseur, getOneFournisseur, newFournisseur, updateFournisseur } from "../controllers/fournisseur.controller.js";
import { getAllCommandeByFournisseur } from "../controllers/commande.controller.js";

const router = express.Router();

router.get("/fournisseur", getAllFournisseur);
router.get("/fournisseur/:id", getOneFournisseur);
router.get("/fournisseur/commande/:id", getAllCommandeByFournisseur);
router.post("/fournisseur/new", newFournisseur);
router.put("/fournisseur/:id", updateFournisseur);
router.delete("/fournisseur/:id", deleteFournisseur);

export default router;