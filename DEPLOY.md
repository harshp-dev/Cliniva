# Deploying Cliniva to Vercel

## Fix: 401 Unauthorized (OpenAI Archived Project)

The error `401 Unauthorized: The project you are requesting has been archived` occurs when something tries to use an **archived or invalid OpenAI API key** during deployment. **Cliniva does not use OpenAI** in its application code—this error usually comes from:

1. **Codex CLI** – If you're using `codex` (OpenAI's coding agent) with `--provider vercel`, it uses OpenAI. Use the standard **Vercel CLI** instead.
2. **Vercel environment variables** – An old `OPENAI_API_KEY` in your Vercel project may point to an archived OpenAI project. Remove it.

---

## Deploy with Vercel CLI (recommended)

### 1. Install Vercel CLI (if needed)

```bash
npm i -g vercel
```

### 2. Remove OpenAI key from Vercel (if present)

1. Go to [vercel.com](https://vercel.com) → your project → **Settings** → **Environment Variables**
2. Delete `OPENAI_API_KEY` if it exists (Cliniva does not need it)

### 3. Deploy

```bash
cd D:\Projects\hackathon\cliniva
vercel
```

Or for production:

```bash
vercel --prod
```

### 4. Set required environment variables in Vercel

In **Settings → Environment Variables**, add:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

Optional (for full features):

- `NEXT_PUBLIC_APP_URL` – Your production URL (e.g. `https://your-app.vercel.app`)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` – For payments
- `TWILIO_*` – For SMS/notifications

---

## If using Codex CLI

If you must use Codex for deployment:

1. **Create a new OpenAI project** at [platform.openai.com](https://platform.openai.com)
2. Generate a new API key (project-scoped `sk-proj-...` preferred)
3. Update your Codex/OpenAI config with the new key
4. Or switch to standard `vercel deploy` to avoid OpenAI entirely

---

## Quick deploy (no OpenAI involved)

```bash
cd D:\Projects\hackathon\cliniva
vercel --yes
```

The `--yes` flag skips prompts and uses defaults.
