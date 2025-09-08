import express from "express";
import { buscarClima } from "../controllers/climaController.js";

const router = express.Router();

router.get("/clima", buscarClima);

export default router;
