import mongoose from "mongoose";

const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const EmpreendimentoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    endereco: {
        cep: { type: String }, 
        rua: { type: String, required: true },
        bairro: { type: String, required: true },
        numero: { type: String },
        complemento: { type: String },
        cidade: { type: String, required: true },
        estado: { type: String, required: true },
    },
    telefone: { type: String },
    email: { type: String },

    palavrasChave: [{ type: String }],

    cidadeNormalizada: { type: String },
    bairroNormalizado: { type: String },
    palavrasChaveNormalizadas: [{ type: String }],
    
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
}, {
    timestamps: true
});

EmpreendimentoSchema.pre("save", function(next) {
    this.cidadeNormalizada = normalizarTexto(this.endereco?.cidade);
    this.bairroNormalizado = normalizarTexto(this.endereco?.bairro);
    this.palavrasChaveNormalizadas = this.palavrasChave?.map(p => normalizarTexto(p)) || [];
    next();
});

EmpreendimentoSchema.pre("findOneAndUpdate", function(next) {
    const update = this.getUpdate();

    if (update.endereco?.cidade) {
        update.cidadeNormalizada = normalizarTexto(update.endereco.cidade);
    }

    if (update.endereco?.bairro) {
        update.bairroNormalizado = normalizarTexto(update.endereco.bairro);
    }

    if (update.palavrasChave) {
        update.palavrasChaveNormalizadas = update.palavrasChave.map(p => normalizarTexto(p));
    }

    next();
});

export default mongoose.model("Empreendimento", EmpreendimentoSchema);
