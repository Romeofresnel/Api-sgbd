import express from "express";
import { deleteCommande, getAllCommande, getOneCommande, newCommande, updateCommande } from "../controllers/commande.controller.js";

const router = express.Router();

router.get("/commande", getAllCommande);
router.get("/commande/:id", getOneCommande);
router.post("/commande/new", newCommande);
router.put("/commande/:id", updateCommande);
router.delete("/commande/:id", deleteCommande);

export default router;