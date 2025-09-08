import Usuario from "../models/Usuario.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const gerarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const existeUsuario = await Usuario.findOne({ email });
        if (existeUsuario) {
            return res.status(400).json({ erro: "Usuário já cadastrado" });
        }

        const usuario = await Usuario.create({ nome, email, senha });
        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            _id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            token: gerarToken(usuario.id)
        });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).json({ erro: error.message });
    }
};

export const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (usuario && (await bcrypt.compare(senha, usuario.senha))) {
            res.json({
                _id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                token: gerarToken(usuario.id)
            });
        } else {
            res.status(400).json({ erro: "Credenciais inválidas" });
        }
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};
