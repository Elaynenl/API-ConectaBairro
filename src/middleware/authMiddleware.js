import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

export const protegerRota = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decodificado = jwt.verify(token, process.env.JWT_SECRET);

            req.usuario = await Usuario.findById(decodificado.id).select("-senha");

            next();
        } catch (error) {
            return res.status(401).json({ erro: "Token inválido" });
        }
    }

    if (!token) {
        return res.status(401).json({ erro: "Não autorizado, token não encontrado" });
    }
};
