import express from "express";
import { deleteUser, getAllUser, getOneUser, newUser, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/user", getAllUser);
router.get("/user/:id", getOneUser);
router.post("/user/new", newUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

export default router;