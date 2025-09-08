import Empreendimento from "../models/Empreendimento.js";
import { buscarEnderecoPorCep } from "../services/viaCepService.js";

function normalizarCep(cep) {
    if (!cep) return "";
    return cep.replace(/\D/g, "");
}

export const buscarEmpreendimentosPorCep = async (req, res) => {
    try {
        const { cep } = req.params;

        const enderecoViaCep = await buscarEnderecoPorCep(cep);

        if (!enderecoViaCep) {
            return res.status(404).json({ erro: "CEP não encontrado na API ViaCEP" });
        }

        const cepNormalizado = normalizarCep(enderecoViaCep.cep);

        const empreendimentos = await Empreendimento.find({ "endereco.cep": cepNormalizado });

        res.json({
            cep: enderecoViaCep.cep,
            rua: enderecoViaCep.rua,
            bairro: enderecoViaCep.bairro,
            cidade: enderecoViaCep.cidade,
            estado: enderecoViaCep.estado,
            empreendimentos
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar empreendimentos por CEP", detalhe: error.message });
    }
};
