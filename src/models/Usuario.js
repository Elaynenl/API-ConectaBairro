import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true, minlength: [6, "A senha deve conter no mínimo 6 caracteres"] }
}, {
    timestamps: true
});

UsuarioSchema.pre("save", async function (next) {
    if (!this.isModified("senha")) return next();
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
});

export default mongoose.model("Usuario", UsuarioSchema);
