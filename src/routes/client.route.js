import express from "express";
import { deleteClient, getAllClient, getOneClient, newClient, updateClient } from "../controllers/client.controller.js";
import { getAllVenteByClient } from "../controllers/vente.controller.js";

const router = express.Router();

router.get("/client", getAllClient);
router.get("/client/:id", getOneClient);
router.get("/client/vente/:id", getAllVenteByClient);
router.post("/client/new", newClient);
router.put("/client/:id", updateClient);
router.delete("/client/:id", deleteClient);

export default router;