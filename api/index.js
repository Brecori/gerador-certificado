const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
const amqp = require("amqplib");
const app = express();

app.use(bodyParser.json());

const client = new Client({
  user: "postgres",
  password: "postgres",
  host: "postgres",
  port: 5432,
  database: "gerador_certificado",
});

const clientInit = async () => {
  let retries = 0;
  await new Promise((res) => setTimeout(res, 10000));
  while (retries < 5) {
    try {
      await client.connect();
      console.log("Conectado ao PostgreSQL!");
      return client;
    } catch (err) {
      console.log(`Falha ao conectar. Tentativas restantes: ${retries}`);
      retries++;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

clientInit();

const sentToQueue = async (message) => {
  try {
    const connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
    const channel = await connection.createChannel();

    const queue = "certificados";

    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log("Mensagem enviada com sucesso", message);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Erro ao enviar mensagem para fila", error);
  }
};

app.post("/certificados", async (req, res) => {
  const {
    nome_aluno,
    data_conclusao,
    nome_curso,
    nacionalidade,
    naturalidade,
    data_nascimento,
    numero_rg,
    data_emissao,
    carga_horaria,
    nome_assinatura,
    cargo,
  } = req.body;

  if (!req.body) {
    return res.status(400).send("Corpo da requisição vazio");
  }

  const query =
    "INSERT INTO certificados (nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, carga_horaria, nome_assinatura, cargo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";

  try {
    await client.query(query, [
      nome_aluno,
      data_conclusao,
      nome_curso,
      nacionalidade,
      naturalidade,
      data_nascimento,
      numero_rg,
      data_emissao,
      carga_horaria,
      nome_assinatura,
      cargo,
    ]);

    sentToQueue(req.body);

    res.status(201).send("Certificado criado com sucesso");
  } catch (err) {
    console.log("deu ruim", err);
  }
});

app.put("/certificado-path/:nome_aluno", async (req, res) => {
  const { nome_aluno } = req.params;
  const { caminho_certificado } = req.body;

  if (!caminho_certificado) {
    return res.status(400).send("O campo caminho_certificado é obrigatório");
  }

  const query =
    "UPDATE certificados SET caminho_certificado = $1 WHERE nome_aluno = $2";

  try {
    const result = await client.query(query, [caminho_certificado, nome_aluno]);

    if (result.rowCount === 0) {
      return res.status(404).send("Certificado não encontrado");
    }

    res.status(200).send("caminho_certificado atualizado com sucesso");
  } catch (err) {
    console.log("Erro ao atualizar caminho_certificado", err);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/certificados/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("Nome do aluno não fornecido");
  }

  const query = "SELECT caminho_certificado FROM certificados WHERE id = $1";

  try {
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send(
          "Certificado não encontrado para o aluno especificado ou aluno não existe"
        );
    }

    const caminhoCertificado = result.rows[0].caminho_certificado;
    res.status(200).json(caminhoCertificado);
  } catch (err) {
    console.error("Erro ao buscar certificado:", err);
    res.status(500).send("Erro interno do servidor");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
