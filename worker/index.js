const amqp = require("amqplib");
const fs = require("fs-extra");
const path = require("path");
const pdfkit = require("pdfkit");
const ejs = require("ejs");
const pdf = require("html-pdf-node");
const cheerio = require("cheerio");
const { default: axios } = require("axios");

const templatePath = path.join(__dirname, "template.html");

const namePdfFormater = (name, curso) => {
  const newName = name.replaceAll(" ", "_");
  const formattedCurso = curso.replaceAll(" ", "_");
  return `${newName}_${formattedCurso}.pdf`;
};

const consumeMessage = async (channel, message) => {
  const data = JSON.parse(message.content.toString());
  console.log(`Dados recebidos: ${JSON.stringify(data)}`);
  const htmlContent = await ejs.renderFile(templatePath, data);

  const $ = cheerio.load(htmlContent);

  $("#nome_aluno").text(data.nome_aluno);
  $("#nacionalidade").text(data.nacionalidade);
  $("#estado").text(data.naturalidade);
  $("#data_nascimento").text(data.data_nascimento);
  $("#documento").text(data.numero_rg);
  $("#data_conclusao").text(data.data_conclusao);
  $("#curso").text(data.nome_curso);
  $("#carga_horaria").text(data.carga_horaria);
  $("#data_emissao").text(data.data_emissao);
  $("#nome_assinatura").text(data.nome_assinatura);
  $("#cargo").text(data.cargo);

  const modifiedHtmlContent = $.html();

  const pdfDir = path.join("/app", "meus-certificados");
  fs.ensureDirSync(pdfDir);
  const pdfName = namePdfFormater(data.nome_aluno, data.nome_curso);
  let pdfPath = path.join(pdfDir, pdfName);

  try {
    console.log("Conteúdo HTML renderizado com sucesso!");

    const options = { format: "A4", landscape: true };
    const pdfBuffer = await pdf.generatePdf(
      { content: modifiedHtmlContent },
      options
    );

    try {
      fs.writeFileSync(pdfPath, pdfBuffer);
      console.log(`PDF salvo com sucesso em: ${pdfPath}`);
      pdfPath = pdfPath.replace(
        "/app/meus-certificados/",
        "C:/meus-certificados/"
      );
    } catch (err) {
      console.error("Erro ao salvar o PDF:", err);
    }

    try {
      await axios.put(`http://api:3000/certificado-path/${data.nome_aluno}`, {
        caminho_certificado: pdfPath,
      });
      console.log(
        "Caminho do certificado atualizado com sucesso no banco de dados"
      );
    } catch (err) {
      console.error(
        "Erro ao atualizar o caminho do certificado no banco de dados:",
        err
      );
    }
    console.log(
      `Certificado para ${data.nome_aluno} gerado com sucesso em ${pdfPath}!`
    );
  } catch (err) {
    console.error("Erro ao processar o certificado:", err);
  }

  channel.ack(message);
};

const workerInit = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
      const channel = await connection.createChannel();

      await channel.assertQueue("certificados", { durable: true });

      channel.consume("certificados", (message) => {
        consumeMessage(channel, message);
      });

      console.log("Worker iniciado. Aguardando mensagens...");
      break;
    } catch (err) {
      retries += 1;
      console.error(
        `Erro de conexão com o RabbitMQ. Retentando em 5 segundos... (${retries}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

workerInit();
