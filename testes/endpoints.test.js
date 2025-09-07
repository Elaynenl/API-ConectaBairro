import request from "supertest";
import app from "../src/app.js";
import {
  conectarBancoMock,
  desconectarBancoMock,
  limparBancoMock
} from "./setupTestDB.js";

let token;
let empreendimentoId;

beforeAll(async () => {
  await conectarBancoMock();
});

afterEach(async () => {
  await limparBancoMock();
});

afterAll(async () => {
  await desconectarBancoMock();
});

describe("Fluxo completo de Usuário e Empreendimentos", () => {
  it("Deve cadastrar usuário", async () => {
    const res = await request(app).post("/usuarios/cadastroUsuario").send({
      nome: "Usuário Teste",
      email: "testando@teste.com",
      senha: "123456"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("token");
  }, 15000);

  it("Deve autenticar usuário e obter token", async () => {
    await request(app).post("/usuarios/cadastroUsuario").send({
      nome: "Usuário Teste",
      email: "testando@teste.com",
      senha: "123456"
    });

    const res = await request(app).post("/usuarios/login").send({
      email: "testando@teste.com",
      senha: "123456"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  }, 15000);

  it("Deve cadastrar empreendimento com token", async () => {
    await request(app).post("/usuarios/cadastroUsuario").send({
      nome: "Usuário Teste",
      email: "testando@teste.com",
      senha: "123456"
    });

    const loginRes = await request(app).post("/usuarios/login").send({
      email: "testando@teste.com",
      senha: "123456"
    });
    token = loginRes.body.token;

    const res = await request(app)
      .post("/empreendimentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Residencial Fortaleza",
        descricao: "Empreendimento de teste",
        endereco: {
          rua: "Av. Beira Mar",
          bairro: "Meireles",
          cidade: "Fortaleza",
          estado: "CE",
          cep: "60110-000"
        },
        palavrasChave: ["fortaleza", "praia"]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    empreendimentoId = res.body._id;
  }, 15000);

  it("Deve listar empreendimentos", async () => {
    await request(app).post("/usuarios/cadastroUsuario").send({
      nome: "Usuário Teste",
      email: "testando@teste.com",
      senha: "123456"
    });

    const loginRes = await request(app).post("/usuarios/login").send({
      email: "testando@teste.com",
      senha: "123456"
    });
    token = loginRes.body.token;

    const cadastro = await request(app)
      .post("/empreendimentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Residencial Fortaleza",
        descricao: "Empreendimento de teste",
        endereco: {
          rua: "Av. Beira Mar",
          bairro: "Meireles",
          cidade: "Fortaleza",
          estado: "CE",
          cep: "60110-000"
        },
        palavrasChave: ["fortaleza", "praia"]
      });

    empreendimentoId = cadastro.body._id;

    const res = await request(app).get("/empreendimentos");
    expect([200, 404]).toContain(res.statusCode);
    expect(res.body).toBeDefined();
  }, 15000);

  it("Deve editar empreendimento", async () => {
    await request(app).post("/usuarios/cadastroUsuario").send({
      nome: "Usuário Teste",
      email: "testando@teste.com",
      senha: "123456"
    });

    const loginRes = await request(app).post("/usuarios/login").send({
      email: "testando@teste.com",
      senha: "123456"
    });
    token = loginRes.body.token;

    const cadastro = await request(app)
      .post("/empreendimentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Residencial Fortaleza",
        descricao: "Empreendimento de teste",
        endereco: {
          rua: "Av. Beira Mar",
          bairro: "Meireles",
          cidade: "Fortaleza",
          estado: "CE",
          cep: "60110-000"
        },
        palavrasChave: ["fortaleza", "praia"]
      });

    empreendimentoId = cadastro.body._id;

    const res = await request(app)
      .put(`/empreendimentos/${empreendimentoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        descricao: "Descrição atualizada"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.empreendimento.descricao).toBe("Descrição atualizada");
  }, 15000);

  it("Deve deletar empreendimento", async () => {
    await request(app).post("/usuarios/cadastroUsuario").send({
      nome: "Usuário Teste",
      email: "testando@teste.com",
      senha: "123456"
    });

    const loginRes = await request(app).post("/usuarios/login").send({
      email: "testando@teste.com",
      senha: "123456"
    });
    token = loginRes.body.token;

    const cadastro = await request(app)
      .post("/empreendimentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Residencial Fortaleza",
        descricao: "Empreendimento de teste",
        endereco: {
          cep: "60110-000",
          rua: "Av. Beira Mar",
          bairro: "Meireles",
          cidade: "Fortaleza",
          estado: "CE"
        },
        palavrasChave: ["fortaleza", "praia"]
      });

    empreendimentoId = cadastro.body._id;

    const res = await request(app)
      .delete(`/empreendimentos/${empreendimentoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensagem).toBe("Empreendimento deletado com sucesso");
  }, 15000);
});

