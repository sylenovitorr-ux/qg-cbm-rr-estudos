# Supabase — QG CBM-RR Estudos

Projeto conectado: `bormijoqcxkdersftifn`.

1. Abra **SQL Editor**, cole o conteúdo de `supabase-schema.sql` e execute.
   O arquivo cria duas áreas protegidas: `user_app_state` para Estudos e
   `taf_user_data` para o TAF.
2. Em **Authentication > URL Configuration**, defina:
   - Site URL: `https://sylenovitorr-ux.github.io/qg-cbm-rr-estudos/`
   - Redirect URL: `https://sylenovitorr-ux.github.io/qg-cbm-rr-estudos/**`
3. No aplicativo, abra **Ajustes > Conta**.
4. Crie uma conta ou entre com e-mail e senha. A mesma sessão é usada nos
   módulos Estudos e TAF.

O PWA continua salvando primeiro no `localStorage`. O Supabase sincroniza uma cópia
por usuário, protegida por RLS. Nunca use a chave `service_role` no navegador ou no
GitHub. A URL e a chave pública do projeto já estão incorporadas ao JavaScript.
