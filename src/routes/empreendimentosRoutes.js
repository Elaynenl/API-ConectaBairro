import express from "express";
import {
    listarEmpreendimentos,
    cadastrarEmpreendimento,
    editarEmpreendimento,
    deletarEmpreendimento
} from "../controllers/empreendimentosController.js";
import { protegerRota } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listarEmpreendimentos);
router.post("/", protegerRota, cadastrarEmpreendimento);
router.put("/:id", protegerRota, editarEmpreendimento);
router.delete("/:id", protegerRota, deletarEmpreendimento);

export default router;
