const express = require('express');

const app = express();


const { Client } = require('pg');

const client = new Client({
    user: 'admin',
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'gerador_certificado'
})


const query = async () => {
    try {
        await client.connect();
        const result = await client.query('SELECT * FROM certificados');
        console.log(result.rows);
    }
    catch (err) {
        console.log('deu ruim', err);
    }
    finally {
        await client.end();
    }
}

app.post('/certificados', async (req, res) => {
    const { nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, diploma_url } = req.body;

    const query = 'INSERT INTO certificados (nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, diploma_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';

    try {
        await client.connect();
        await client.query(query, [nome_aluno, data_conclusao, nome_curso, nacionalidade, naturalidade, data_nascimento, numero_rg, data_emissao, diploma_url]);
        res.status(201).send('Certificado criado com sucesso');
    }
    catch (err) {
        console.log('deu ruim', err);
    }
    finally {
        await client.end();
    }
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});