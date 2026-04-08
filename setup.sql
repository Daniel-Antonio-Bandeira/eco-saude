-- Execute este script no pgAdmin ou no terminal psql
-- para criar o banco e a tabela de denúncias

-- 1. Crie o banco (faça isso antes de rodar o resto):
-- CREATE DATABASE eco_saude;

-- 2. Tabela de denúncias (com foto e localização)
CREATE TABLE IF NOT EXISTS denuncias (
  id          SERIAL PRIMARY KEY,
  tipo        VARCHAR(100)  NOT NULL,
  descricao   TEXT          NOT NULL,
  foto        VARCHAR(255),          -- caminho do arquivo salvo
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,
  data_criacao TIMESTAMP DEFAULT NOW()
);
