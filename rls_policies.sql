-- POLÍTICAS RLS (Row Level Security) PARA SUPABASE
-- Execute após setup_database.sql para proteger os dados
-- Requer Supabase Auth configurado

-- Habilitar RLS em todas as tabelas
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_wpp ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- LEADS: visitantes podem inserir (formulário do site), autenticados podem ler/atualizar/excluir
CREATE POLICY "Leads: insert público" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Leads: select autenticados" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leads: update autenticados" ON leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Leads: delete autenticados" ON leads FOR DELETE TO authenticated USING (true);

-- COLUMNS: apenas autenticados
CREATE POLICY "Columns: all autenticados" ON columns FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CONTATOS_WPP: apenas autenticados
CREATE POLICY "Contatos: all autenticados" ON contatos_wpp FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ACTIVITY_LOG: apenas autenticados
CREATE POLICY "Activity: all autenticados" ON activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
