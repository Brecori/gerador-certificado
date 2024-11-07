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
    diploma_url,
  } = req.body;

  if (!req.body) {
    return res.status(400).send("Corpo da requisição vazio");
  }

  const query =
    "INSERT INTO certificados (nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, carga_horaria, nome_assinatura, cargo, diploma_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";

  try {
    await client.connect();
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
      diploma_url
    ]);

    sentToQueue(req.body);

    await client.end();

    res.status(201).send("Certificado criado com sucesso");
  } catch (err) {
    console.log("deu ruim", err);
    await client.end();
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
