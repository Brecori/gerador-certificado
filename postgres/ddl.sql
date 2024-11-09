CREATE TABLE IF NOT EXISTS certificados (
    id SERIAL PRIMARY KEY,
    nome_aluno VARCHAR(255) NOT NULL,
    data_conclusao VARCHAR(255) NOT NULL,
    nome_curso VARCHAR(255) NOT NULL,
    nacionalidade VARCHAR(255) NOT NULL,
    naturalidade VARCHAR(255) NOT NULL,
    data_nascimento VARCHAR(255) NOT NULL,
    numero_rg VARCHAR(255) NOT NULL,
    data_emissao VARCHAR(255) NOT NULL,
    carga_horaria VARCHAR(255) NOT NULL,
    nome_assinatura VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    caminho_certificado VARCHAR(255)
);