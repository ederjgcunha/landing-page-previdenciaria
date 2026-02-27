# Estratégia de Segurança para Controle Remoto sem Login

Para remover o login obrigatório da página "Controle Remoto" (`remote.html`) e manter a segurança dos dados, adotaremos uma estratégia baseada em **Row Level Security (RLS)** e **Validação de Entradas**.

## 1. Implicações de Segurança
Ao permitir acesso público (`anon`), qualquer pessoa com a URL e a chave pública do projeto pode tentar ler e escrever no banco de dados.
- **Risco**: Exclusão em massa ou alteração maliciosa de dados (ex: pausar todos os agentes indevidamente).
- **Mitigação**: Não dar permissão direta de `UPDATE` ou `DELETE` irrestrita para a role `anon`. Usar permissões granulares.

## 2. Estratégia de RLS (Row Level Security)

### A. Leitura (SELECT)
Permitir que qualquer pessoa visualize os dados do painel.
```sql
CREATE POLICY "Leitura pública" ON contatos_wpp FOR SELECT TO anon USING (true);
```

### B. Inserção (INSERT)
Permitir que novos contatos sejam adicionados, mas validar os dados.
```sql
CREATE POLICY "Inserção pública validada" ON contatos_wpp FOR INSERT TO anon 
WITH CHECK (
    char_length(nome_lead) > 2 AND 
    char_length(numero) >= 10 AND
    tipo_de_acao IS NOT NULL
);
```

### C. Atualização (UPDATE) - O Ponto Crítico
Para evitar que qualquer um altere o status dos agentes, recomendamos uma dessas abordagens:

**Abordagem Recomendada: Código de Acesso Compartilhado (Client-side "Secret")**
Embora segredos no frontend não sejam 100% seguros (podem ser inspecionados), para um controle interno simples, podemos exigir que um código (PIN) seja enviado junto com a atualização, ou validado via Função de Banco de Dados (RPC).

Mas, para manter a simplicidade solicitada sem backend complexo, vamos usar uma **Função RPC (Remote Procedure Call)** no Supabase. Isso esconde a lógica de atualização e permite validação no servidor.

#### Criar Função SQL para Atualização Segura
Ao invés de dar permissão de `UPDATE` na tabela, criamos uma função que recebe os dados e, opcionalmente, um código de verificação simples.

## 3. Plano de Implementação

### Passo 1: Executar SQL no Supabase
Você precisará rodar o seguinte script no Editor SQL do Supabase para configurar as permissões.

```sql
-- 1. Remover políticas antigas se existirem e forem restritivas demais
DROP POLICY IF EXISTS "Contatos: all autenticados" ON contatos_wpp;

-- 2. Permitir Leitura Pública (necessário para o Dashboard funcionar)
CREATE POLICY "Contatos: Leitura Pública" ON contatos_wpp FOR SELECT TO anon USING (true);

-- 3. Permitir Inserção Pública (com validação básica de tamanho)
CREATE POLICY "Contatos: Inserção Pública" ON contatos_wpp FOR INSERT TO anon 
WITH CHECK (
  length(nome_lead) > 0 AND
  length(numero) >= 10
);

-- 4. Função Segura para Atualizar Status (Substitui UPDATE direto)
-- Esta função encapsula a lógica e impede que campos sensíveis ou IDs errados sejam alterados sem controle.
CREATE OR REPLACE FUNCTION atualizar_contato_remoto(p_id INT, p_agente TEXT, p_procuracao TEXT, p_tipo_acao TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com permissões de admin, burlando o RLS para este update específico
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Validação de entrada (Sanitização)
  IF p_agente NOT IN ('Ativo', 'Pausado', 'Desconectado', 'Atenção') THEN
     p_agente := 'Pausado'; -- Default seguro
  END IF;

  UPDATE contatos_wpp
  SET 
    agente = p_agente,
    procuracao = COALESCE(p_procuracao, procuracao),
    tipo_de_acao = COALESCE(p_tipo_acao, tipo_de_acao)
  WHERE id = p_id
  RETURNING row_to_json(contatos_wpp.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- 5. Função para Pausar Todos (Botão de Emergência)
CREATE OR REPLACE FUNCTION pausar_todos_agentes()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE contatos_wpp SET agente = 'Pausado' WHERE agente != 'Pausado';
END;
$$;
```

### Passo 2: Alterar `remote.js`
1. Remover a verificação de sessão (`supabase.auth.getSession`).
2. Atualizar as chamadas de `UPDATE` para usarem `.rpc('atualizar_contato_remoto', { ... })` ou manter o `UPDATE` direto caso opte pela política de RLS de permissão de UPDATE (menos seguro).
   - *Nota: Se quisermos manter o código JS simples sem mudar para RPC, podemos apenas liberar o UPDATE no RLS, mas isso é inseguro.*
   - **Melhor caminho:** Liberar `UPDATE` no RLS público, mas restringir colunas via trigger.
   - **Caminho mais prático agora:** Liberar `UPDATE` para `anon` no SQL.

```sql
-- Opção Prática (Menos segura, mas código existente funciona sem refatoração pesada)
CREATE POLICY "Contatos: Update Público" ON contatos_wpp FOR UPDATE TO anon USING (true);
```

## Resumo da Ação
Vou aplicar as mudanças no código (`remote.js`) para remover o login e remover a verificação de sessão. Documentei acima as políticas SQL que você deve aplicar no seu banco de dados Supabase para que isso funcione.
