# EmilliStore

Loja de roupas + painel admin. Dados locais por padrão; com `.env` usa **Supabase**.

## 1. Rodar o app

```bash
npm install
npm run dev
```

- Loja: http://localhost:5173/
- Admin local (sem Supabase): senha `emilli`
- Admin com Supabase: e-mail/senha do **Authentication → Users**

## 2. Conectar ao Supabase

### A) Pegar as chaves
1. Abra o projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. **Project Settings → API**
3. Copie:
   - **Project URL**
   - **anon public** / **publishable** key

### B) Criar o arquivo `.env`

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publishable_ou_anon
```

### C) Criar as tabelas
1. **SQL Editor → New query**
2. Cole `supabase/schema.sql` → **Run**
3. (Opcional) `supabase/fix-rls.sql` e `supabase/realtime.sql`

### D) Criar usuário admin
1. **Authentication → Users → Add user**
2. Marque **Auto Confirm User**
3. Entre em `/admin` com esse e-mail e senha

## 3. Publicar na Vercel

1. Suba o código no GitHub (ou importe a pasta no site da Vercel)
2. Em [vercel.com/new](https://vercel.com/new) → **Import** do repositório
3. Framework: **Vite** (detecta sozinho)
4. Em **Environment Variables**, adicione (Production + Preview):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://ajzogglaiepzjooaevpr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | sua publishable/anon key |

5. **Deploy**
6. No Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://seu-projeto.vercel.app`
   - **Redirect URLs**: `https://seu-projeto.vercel.app/**`

O arquivo `vercel.json` já cuida do roteamento SPA (`/admin`, etc.).
