# Supabase — QG CBM-RR Estudos

1. Crie um projeto Supabase exclusivo para este aplicativo.
2. Abra **SQL Editor**, cole o conteúdo de `supabase-schema.sql` e execute.
3. Em **Authentication > URL Configuration**, defina:
   - Site URL: `https://sylenovitorr-ux.github.io/qg-cbm-rr-estudos/`
   - Redirect URL: `https://sylenovitorr-ux.github.io/qg-cbm-rr-estudos/**`
4. No aplicativo, abra **Ajustes > Conta**.
5. Cole o **Project URL** e a chave **Publishable / anon**.
6. Crie uma conta ou entre com e-mail e senha.

O PWA continua salvando primeiro no `localStorage`. O Supabase sincroniza uma cópia
por usuário, protegida por RLS. Nunca use a chave `service_role` no navegador ou no
GitHub.
