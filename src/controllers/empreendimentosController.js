import Empreendimento from "../models/Empreendimento.js";
import dotenv from "dotenv";
import { buscarEnderecoPorCep } from "../services/viaCepService.js";
import { buscarClima } from "../services/climaService.js";

dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

function normalizar(texto) {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizarCep(cep) {
  if (!cep) return "";
  return cep.replace(/\D/g, "");
}

export const listarEmpreendimentos = async (req, res) => {
  try {
    const { rua, bairro, cidade, estado, palavra, cep } = req.query;

    let filtro = {};
    if (rua) filtro["endereco.rua"] = { $regex: rua, $options: "i" };
    if (bairro) filtro["bairroNormalizado"] = { $regex: normalizar(bairro), $options: "i" };
    if (cidade) filtro["cidadeNormalizada"] = { $regex: normalizar(cidade), $options: "i" };
    if (estado) filtro["endereco.estado"] = { $regex: estado, $options: "i" };
    if (palavra) filtro["palavrasChaveNormalizadas"] = { $regex: normalizar(palavra), $options: "i" };
    if (cep) filtro["endereco.cep"] = { $regex: normalizarCep(cep), $options: "i" };

    const empreendimentos = await Empreendimento.find(filtro).populate("criadoPor", "nome email");

    if (empreendimentos.length === 0) {
      return res.status(404).json({ mensagem: "Nenhum empreendimento encontrado para os filtros informados." });
    }

    const cidadesAgrupadas = {};
    for (const emp of empreendimentos) {
      const cidadeEmp = emp.cidadeNormalizada || normalizar(emp.endereco?.cidade);
      if (!cidadeEmp) continue;

      if (!cidadesAgrupadas[cidadeEmp]) {
        cidadesAgrupadas[cidadeEmp] = [];
      }
      cidadesAgrupadas[cidadeEmp].push(emp);
    }

    const respostaFinal = [];
    for (const cidade in cidadesAgrupadas) {
      const clima = await buscarClima(cidade);
      respostaFinal.push({
        cidade,
        clima,
        empreendimentos: cidadesAgrupadas[cidade]
      });
    }

    res.json(respostaFinal);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar empreendimentos", detalhe: error.message });
  }
};

export const cadastrarEmpreendimento = async (req, res) => {
  try {
    const { nome, descricao, endereco, telefone, email, palavrasChave } = req.body;

    let enderecoFinal = endereco;
    if (endereco?.cep) {
      const enderecoViaCep = await buscarEnderecoPorCep(endereco.cep);
      if (enderecoViaCep) {
        enderecoFinal = { ...endereco, ...enderecoViaCep };
      }
    }

    enderecoFinal.cep = normalizarCep(enderecoFinal.cep);

    const novoEmpreendimento = new Empreendimento({
      nome,
      descricao,
      endereco: enderecoFinal,
      telefone,
      email,
      palavrasChave,
      palavrasChaveNormalizadas: palavrasChave.map(p => normalizar(p)),
      cidadeNormalizada: normalizar(enderecoFinal?.cidade),
      bairroNormalizado: normalizar(enderecoFinal?.bairro),
      criadoPor: req.usuario.id
    });

    const salvo = await novoEmpreendimento.save();
    
    res.status(201).json({
      mensagem: "Empreendimento cadastrado com sucesso",
      empreendimento: salvo
    });

  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar empreendimento", detalhe: error.message });
  }
};

export const editarEmpreendimento = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const { id } = req.params;
    const empreendimento = await Empreendimento.findById(id);

    if (!empreendimento) {
      return res.status(404).json({ erro: "Empreendimento não encontrado" });
    }

    if (!empreendimento.criadoPor || empreendimento.criadoPor.toString() !== req.usuario.id) {
      return res.status(403).json({ erro: "Você não tem permissão para editar este empreendimento" });
    }

    const dadosAtualizados = req.body;

    if (dadosAtualizados.endereco) {
      const enderecoAtual = empreendimento.endereco?.toObject() || {};
      let enderecoNovo = {
        ...enderecoAtual,
        ...dadosAtualizados.endereco
      };

      if (dadosAtualizados.endereco.cep) {
        const cepNormalizado = normalizarCep(dadosAtualizados.endereco.cep);
        enderecoNovo.cep = cepNormalizado;

        const enderecoViaCep = await buscarEnderecoPorCep(cepNormalizado);
        if (enderecoViaCep) {
          enderecoNovo = {
            ...enderecoNovo,
            ...enderecoViaCep
          };
        }
      }

      dadosAtualizados.endereco = enderecoNovo;

      if (enderecoNovo.cidade) {
        dadosAtualizados.cidadeNormalizada = normalizar(enderecoNovo.cidade);
      }

      if (enderecoNovo.bairro) {
        dadosAtualizados.bairroNormalizado = normalizar(enderecoNovo.bairro);
      }
    }

    if (dadosAtualizados.palavrasChave) {
      dadosAtualizados.palavrasChaveNormalizadas = dadosAtualizados.palavrasChave.map(p => normalizar(p));
    }

    const atualizado = await Empreendimento.findByIdAndUpdate(id, dadosAtualizados, { new: true,
      runValidators: true
    });

    res.json({
      mensagem: "Empreendimento atualizado com sucesso",
      empreendimento: atualizado
    });
  
} catch (error) {
  if (error.name === "ValidationError") {
    const camposInvalidos = Object.keys(error.errors);
    const mensagemFormatada = `Os seguintes campos são obrigatórios e não podem estar em branco: ${camposInvalidos.join(", ")}`;

    return res.status(400).json({
      erro: "Erro ao editar empreendimento",
      camposObrigatorios: camposInvalidos,
      mensagem: mensagemFormatada
    });
  }

  res.status(500).json({ erro: "Erro ao editar empreendimento", detalhe: error.message });
}
};

export const deletarEmpreendimento = async (req, res) => {
  try {
    const { id } = req.params;
    const empreendimento = await Empreendimento.findById(id);

    if (!empreendimento) return res.status(404).json({ erro: "Empreendimento não encontrado" });
    if (empreendimento.criadoPor.toString() !== req.usuario.id) {
      return res.status(403).json({ erro: "Você não tem permissão para deletar este empreendimento" });
    }

    await empreendimento.deleteOne();
    res.json({ mensagem: "Empreendimento deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar empreendimento", detalhe: error.message });
  }
};
