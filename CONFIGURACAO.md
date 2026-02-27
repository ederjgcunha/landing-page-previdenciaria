# Configuração do CRM AdvPrevidenciária

## 1. Autenticação (Supabase Auth)

O login usa **Supabase Auth** com email e senha. Nenhuma senha fica no código.

### Criar usuário de acesso

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Users**
4. Clique em **Add user** → **Create new user**
5. Informe um **email** e **senha** (ex: admin@seudominio.com)
6. Use essas credenciais para acessar o CRM em `login.html`

## 2. Banco de Dados (Supabase)

### Instalação nova

Execute no **SQL Editor** do Supabase, nesta ordem:

1. `setup_database.sql` – cria as tabelas
2. `rls_policies.sql` – ativa políticas de segurança

### Instalação já existente

Se você já tinha o CRM instalado, execute:

1. `migration_existente.sql` – ajusta colunas e cria `activity_log`
2. `rls_policies.sql` – ativa políticas de segurança (opcional, mas recomendado)

## 3. Credenciais Supabase

O arquivo `supabase-config.js` contém a **URL** e a **chave anônima (anon key)** do projeto. 

- Obtenha em: Supabase Dashboard → **Settings** → **API**
- A anon key é segura para uso no cliente; a proteção dos dados vem das políticas RLS

## 4. Estrutura de tabelas

| Tabela         | Descrição                    |
|----------------|------------------------------|
| `leads`        | Contatos vindos do site      |
| `columns`      | Colunas do Kanban            |
| `contatos_wpp` | Contatos do controle de agente |
| `activity_log` | Log de atividades do remoto  |
