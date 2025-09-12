import express from "express";
import dotenv from "dotenv";
import conectarBanco from "./config/db.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import empreendimentosRoutes from "./routes/empreendimentosRoutes.js";
import cepRoutes from "./routes/cepRoutes.js";
import climaRoutes from "./routes/climaRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  conectarBanco();
}

app.use("/usuarios", usuariosRoutes);
app.use("/empreendimentos", empreendimentosRoutes);
app.use("/externo/cep", cepRoutes);
app.use("/api", climaRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Erro interno:", err);
  res.status(500).json({ erro: "Erro interno no servidor" });
});

export default app;
