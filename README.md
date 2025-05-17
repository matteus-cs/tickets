# API de Venda de Ingressos

## Sobre o Projeto

Este projeto é uma **API REST** para gerenciamento e venda de ingressos para eventos, voltada para atender tanto **parceiros** (organizadores de eventos) quanto **clientes** (compradores de ingressos).
A API permite que parceiros criem e gerenciem eventos e seus respectivos tickets, enquanto os clientes podem visualizar eventos, realizar compras e gerenciar seus pedidos.

### Funcionalidades principais:

- Registro e autenticação de **parceiros** e **clientes**.
- Criação e gerenciamento de **eventos** e **tickets** por parceiros.
- **Compra simultânea** de tickets de múltiplos eventos por clientes.
- **Controle de concorrência** para garantir que um ticket só possa ser comprado por um cliente por vez.
- **Dashboard de parceiros** com visualização das vendas por evento.

## Tecnologias Utilizadas

- **TypeScript** — Linguagem principal do projeto.
- **Node.js** — Ambiente de execução backend.
- **NestJS** — Framework para construção de APIs escaláveis e estruturadas.
- **TypeORM** — ORM para abstração e manipulação do banco de dados relacional.
- **Stripe** — Plataforma de pagamentos utilizada para processar compras com segurança.
- **PostgreSQL** — Banco de dados relacional.
- **Docker** — Facilita o ambiente de desenvolvimento e deploy.
- **Jest** — Testes automatizados (utilizado por padrão com NestJS).

## Requerimentos

- Node.js 20+
- Docker

## Rodar a aplicação

```bash
docker compose up -d --build
```


**Entre no container do app:**
```bash
docker compose exec app bash 
```

**Entre no container do app:**
```bash
docker compose exec app bash 
```

**Para executar os testes:**
```bash
npm run test
```

**Para rodar aplicação:**
```bash
npm run start
```

## Requisitos do sistema

Leia o arquivo [requisitos-sistema.md](./requisitos-sistema.md) para entender o escopo do sistema.