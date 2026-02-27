-- Script de Criação de Tabelas para o CRM de Advocacia (Simplificado)
-- Compatível com PostgreSQL / Supabase

-- 1. Tabela de Leads (Interessados vindos do site)
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Colunas do Kanban
CREATE TABLE IF NOT EXISTS columns (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    position INTEGER
);

-- 3. Tabela de Contatos WhatsApp (Controle remoto - schema padronizado)
CREATE TABLE IF NOT EXISTS contatos_wpp (
    id SERIAL PRIMARY KEY,
    nome_lead VARCHAR(255),
    numero VARCHAR(50) UNIQUE,
    agente VARCHAR(20) DEFAULT 'Pausado',
    procuracao VARCHAR(20) DEFAULT 'Sim',
    tipo_de_acao VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Log de Atividades (sincronização com Supabase)
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    msg TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_contatos_wpp_numero ON contatos_wpp(numero);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- Migração: se existir coluna tipo_de_ação, criar tipo_de_acao e copiar dados
-- Execute manualmente no Supabase SQL Editor se sua tabela já existir:
-- ALTER TABLE contatos_wpp RENAME COLUMN "tipo_de_ação" TO tipo_de_acao;
