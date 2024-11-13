# Gerador de Certificados

Este projeto permite a geração automática de certificados personalizados em formato PDF, com base em um template predefinido. A aplicação recebe dados de entrada via uma requisição POST, insere as informações no template do certificado e, em seguida, gera um PDF que é salvo em um diretório no sistema do usuário. Uma rota adicional permite ao usuário recuperar o caminho de acesso ao PDF gerado por meio de uma requisição GET. 

## Como rodar

- Abra o repositório do projeto

- Rode o comando:

```docker
 docker compose up --build -d
```

**É importante esperar cerca de 5 segundos para que o rabbit, redis e postgres estejam completamente conectados**

- Faça a requisição

```curl
curl --location 'http://localhost:3000/certificados' \
--header 'Content-Type: application/json' \
--data '{
    "nome_aluno": "Marcelo",
    "data_conclusao": "11/11/2024",
    "nome_curso": "Gastronomia",
    "nacionalidade": "Brasileiro",
    "naturalidade": "São Paulo",
    "data_nascimento": "11/04/2005",
    "numero_rg": "123456789",
    "data_emissao": "01/12/2023",
    "carga_horaria": "80", 
    "nome_assinatura": "Carlos Souza",
    "cargo": "Coordenador de Cursos"
}
'
```

- Após o envio do certificado, você pode fazer uma outra requisição GET para ter o retorno do caminho do certificado.

```
curl --location 'http://localhost:3000/certificados/1'
```