import express from "express";
import { deleteVente, getAllVente, getOneVente, newVente, updateVente } from "../controllers/vente.controller.js";

const router = express.Router();

router.get("/vente", getAllVente);
router.get("/vente/:id", getOneVente);
router.post("/vente/new", newVente);
router.put("/vente/:id", updateVente);
router.delete("/vente/:id", deleteVente);

export default router;