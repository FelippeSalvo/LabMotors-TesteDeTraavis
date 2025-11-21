# Instruções para Configurar o Banco de Dados Supabase

## 1. Executar o Script SQL

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `schema.sql` que está em `LMAPI/Data/schema.sql`
6. Clique em **Run** para executar o script

**IMPORTANTE**: 
- O script irá **DROPAR** (deletar) as tabelas existentes se houver conflito de nomes
- Após executar o script, aguarde **10-30 segundos** para o PostgREST atualizar o schema cache
- Se você receber erros sobre tabelas não encontradas, aguarde alguns segundos e tente novamente

## 2. Verificar as Tabelas Criadas

Após executar o script, você deve ter as seguintes tabelas:
- `clientes`
- `pecas`
- `servicos`
- `pecas_usadas`
- `ordens_servico`

Para verificar, vá em **Table Editor** no painel do Supabase.

## 3. Configuração da Aplicação

A aplicação já está configurada para usar o Supabase com as seguintes credenciais:
- URL: `https://valqzdvzpxicoxocmkcq.supabase.co`
- Service Role Key: (configurada no código)

**IMPORTANTE**: As credenciais estão hardcoded no código por enquanto. Em produção, você deve usar variáveis de ambiente ou um arquivo de configuração seguro.

## 4. Migração de Dados (Opcional)

Se você tinha dados nos arquivos JSON anteriores e quer migrá-los para o Supabase, você precisará criar um script de migração ou importar manualmente através do painel do Supabase.

## 5. Testar a Aplicação

Após executar o script SQL, você pode iniciar a aplicação normalmente:

```bash
dotnet run
```

A aplicação agora usará o Supabase como banco de dados ao invés dos arquivos JSON.

