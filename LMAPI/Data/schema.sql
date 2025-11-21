-- Script SQL para criar as tabelas no Supabase

-- IMPORTANTE: Após executar este script, o PostgREST pode levar alguns segundos para atualizar o schema cache.
-- Se você receber erros sobre tabelas não encontradas, aguarde alguns segundos e tente novamente.

-- Tabela de Clientes
-- Se a tabela já existir com outro nome, você pode precisar renomeá-la ou recriá-la
DROP TABLE IF EXISTS clientes CASCADE;
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    endereco TEXT,
    senha VARCHAR(255) NOT NULL,
    admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Peças
DROP TABLE IF EXISTS pecas CASCADE;
CREATE TABLE pecas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços
DROP TABLE IF EXISTS servicos CASCADE;
CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    descricao TEXT,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    valor_total DECIMAL(10, 2) DEFAULT 0,
    -- Campos para agendamento/solicitação
    cliente VARCHAR(255),
    tipo_servico VARCHAR(255),
    moto VARCHAR(255),
    placa VARCHAR(20),
    telefone VARCHAR(50),
    data TIMESTAMP WITH TIME ZONE,
    horario VARCHAR(10),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Peças Usadas (relacionamento muitos-para-muitos entre Serviços e Peças)
DROP TABLE IF EXISTS pecas_usadas CASCADE;
CREATE TABLE pecas_usadas (
    id SERIAL PRIMARY KEY,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    peca_id INTEGER NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(servico_id, peca_id)
);

-- Tabela de Ordens de Serviço
DROP TABLE IF EXISTS ordens_servico CASCADE;
CREATE TABLE ordens_servico (
    id SERIAL PRIMARY KEY,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'Aguardando',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_servicos_cliente_id ON servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_placa ON servicos(placa);
CREATE INDEX IF NOT EXISTS idx_servicos_data ON servicos(data);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_servico_id ON ordens_servico(servico_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_pecas_usadas_servico_id ON pecas_usadas(servico_id);
CREATE INDEX IF NOT EXISTS idx_pecas_usadas_peca_id ON pecas_usadas(peca_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pecas_updated_at BEFORE UPDATE ON pecas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

