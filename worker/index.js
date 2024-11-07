const amqp = require("amqplib");
const fs = require("fs-extra");
const path = require("path");
const pdfkit = require("pdfkit");
const ejs = require("ejs");
const pdf = require("html-pdf-node");
const cheerio = require("cheerio");

const templatePath = path.join(__dirname, "template.html");

const namePdfFormater = (name) => {
  const words = name.split(" ");
  const firstName = words[0];
  const lastName = words[words.length - 1];
  return `${firstName}_${lastName}.pdf`;
};

const consumeMessage = async (channel, message) => {
  const data = JSON.parse(message.content.toString());
  console.log(`Dados recebidos: ${JSON.stringify(data)}`);
  const htmlContent = await ejs.renderFile(templatePath, data);

  const $ = cheerio.load(htmlContent);

  // Substitui o conteúdo usando os IDs dos elementos
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

  // Salva o HTML modificado como string
  const modifiedHtmlContent = $.html();

  // Diretório e nome do arquivo PDF
  const pdfDir = path.join(__dirname, "pdf_files");
  fs.ensureDirSync(pdfDir);
  const pdfName = namePdfFormater(data.nome_aluno);
  const pdfPath = path.join(pdfDir, pdfName);

  try {
    // Renderiza o conteúdo HTML usando EJS com await
    console.log("Conteúdo HTML renderizado com sucesso!");

    // Gerando o PDF com o conteúdo HTML renderizado
    const options = { format: "A4", landscape: true };
    const pdfBuffer = await pdf.generatePdf(
      { content: modifiedHtmlContent },
      options
    );

    // Salvando o PDF no diretório desejado
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(
      `Certificado para ${data.nome_aluno} gerado com sucesso em ${pdfPath}!`
    );
  } catch (err) {
    console.error("Erro ao processar o certificado:", err);
  }

  // Confirma que a mensagem foi processada
  channel.ack(message);
};

const workerInit = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
      const channel = await connection.createChannel();

      // Declara a fila
      await channel.assertQueue("certificados", { durable: true });

      // Consome as mensagens da fila
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
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguarda 5 segundos antes de tentar novamente
    }
  }
};

workerInit();
