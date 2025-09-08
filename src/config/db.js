import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB conectado com sucesso!");
    } catch (error) {
        console.error("Erro na conexão com MongoDB:", error.message);
        process.exit(1);
    }
};

export default conectarDB;
