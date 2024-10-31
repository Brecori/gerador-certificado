CREATE DATABASE IF NOT EXISTS gerador_certificado;
USE gerador_certificado;

CREATE TABLE IF NOT EXISTS certificados (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome_aluno VARCHAR(255) NOT NULL,
    data_conclusao VARCHAR(255) NOT NULL,
    nome_curso VARCHAR(255) NOT NULL,
    nacionalidade VARCHAR(255) NOT NULL,
    naturalidade VARCHAR(255) NOT NULL,
    data_nascimento VARCHAR(255) NOT NULL,
    numero_rg VARCHAR(255) NOT NULL,
    data_emissao VARCHAR(255) NOT NULL,
    diploma_url VARCHAR(255) 
)