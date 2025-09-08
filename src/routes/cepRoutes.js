import express from "express";
import { buscarEmpreendimentosPorCep } from "../controllers/cepController.js";

const router = express.Router();

router.get("/:cep", buscarEmpreendimentosPorCep);

export default router;
