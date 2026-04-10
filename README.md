# 🌿 Eco Saúde

> Sistema web de denúncias ambientais e de saúde — Projeto de Extensão Universitária

![Status](https://img.shields.io/badge/status-online-brightgreen)
![Node](https://img.shields.io/badge/Node.js-v22-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

**🔗 Acesse:** [eco-saude.onrender.com](https://eco-saude.onrender.com)

---

## 📋 Sobre o Projeto

O **Eco Saúde** é uma plataforma web que permite que cidadãos registrem denúncias ambientais e de saúde na sua região — como descarte irregular de lixo, água contaminada, esgoto a céu aberto e queimadas.

O objetivo é conectar a comunidade com dados reais, facilitando o acompanhamento e a resolução dos problemas registrados.

---

## ✨ Funcionalidades

- 📋 **Registro de denúncias** com tipo, descrição e endereço
- 📷 **Upload de fotos** como evidência (drag and drop)
- 📍 **Localização GPS automática** marcada no mapa
- 🗺️ **Mapa interativo** com todas as ocorrências (OpenStreetMap)
- 📊 **Dashboard** com gráficos de denúncias por tipo, status e mês
- 🔄 **Status de acompanhamento** — Pendente, Em análise, Resolvida
- 🔐 **Sistema de login** com dois perfis: Administrador e Cidadão
- 🗑️ **Gerenciamento** — admin pode excluir e atualizar status das denúncias

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Uso |
|------------|-----|
| HTML5 + CSS3 | Estrutura e estilização |
| JavaScript Vanilla | Lógica do cliente |
| [Leaflet.js](https://leafletjs.com/) | Mapa interativo |
| [Chart.js](https://www.chartjs.org/) | Gráficos do dashboard |

### Backend
| Tecnologia | Uso |
|------------|-----|
| [Node.js](https://nodejs.org/) | Ambiente de execução |
| [Express.js](https://expressjs.com/) | Framework web |
| [JWT](https://jwt.io/) | Autenticação segura |
| [Multer](https://github.com/expressjs/multer) | Upload de arquivos |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Criptografia de senhas |

### Banco de Dados & Infra
| Tecnologia | Uso |
|------------|-----|
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional |
| [pg](https://node-postgres.com/) | Driver Node.js para PostgreSQL |
| [Render](https://render.com/) | Hospedagem do servidor e banco |
| [GitHub](https://github.com/) | Controle de versão |

---

## 🏗️ Arquitetura

```
eco-saude/
├── public/              # Frontend (HTML, CSS, JS)
│   ├── index.html       # Página principal — formulário e mapa
│   ├── dashboard.html   # Dashboard com gráficos
│   ├── login.html       # Tela de login e cadastro
│   ├── app.js           # Lógica do frontend principal
│   ├── dashboard.js     # Lógica do dashboard
│   ├── login.js         # Lógica de autenticação
│   ├── style.css        # Estilos globais
│   ├── dashboard.css    # Estilos do dashboard e navegação
│   └── login.css        # Estilos da tela de login
├── uploads/             # Fotos enviadas pelos usuários
├── server.js            # Servidor Express + rotas da API
├── db.js                # Conexão com o PostgreSQL
├── package.json         # Dependências do projeto
└── .env                 # Variáveis de ambiente (não versionado)
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Daniel-Antonio-Bandeira/eco-saude.git
cd eco-saude

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# 4. Crie o banco de dados
# No pgAdmin ou psql, execute:
# CREATE DATABASE eco_saude;
# Depois rode os scripts setup.sql e setup_usuarios.sql

# 5. Inicie o servidor
node server.js
```

Acesse em: `http://localhost:3000`

---

## 🔑 Acesso

| Perfil | Como acessar |
|--------|-------------|
| Administrador | Entre em contato com o responsável pelo projeto |
| Cidadão | Cadastre-se diretamente na plataforma |

---

## 📡 Rotas da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `GET` | `/denuncias` | Lista todas as denúncias | — |
| `POST` | `/denuncias` | Cria nova denúncia | — |
| `PATCH` | `/denuncias/:id/status` | Atualiza status | Admin |
| `DELETE` | `/denuncias/:id` | Remove denúncia | Admin |
| `POST` | `/auth/login` | Realiza login | — |
| `POST` | `/auth/registro` | Cria nova conta | — |

---

## 📚 Aprendizados

Este projeto foi desenvolvido como parte de um **Projeto de Extensão Universitária** e envolveu:

- Desenvolvimento full stack com JavaScript
- Modelagem e consultas em banco de dados relacional
- Autenticação segura com JWT e bcrypt
- Integração com APIs de mapeamento
- Deploy em ambiente de produção na nuvem
- Controle de versão com Git e GitHub

---

## 👨‍💻 Autor

**Daniel Antonio Bandeira**

[![GitHub](https://img.shields.io/badge/GitHub-Daniel--Antonio--Bandeira-181717?logo=github)](https://github.com/Daniel-Antonio-Bandeira)

---

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
