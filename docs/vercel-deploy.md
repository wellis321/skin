# Deploy the skin app to Vercel

Get a shareable URL so others can try the app and give feedback.

## Reusing an existing Vercel project

If you already have a project (e.g. **cv-app**) and want to point it at the skin repo:

1. Open the project: [vercel.com](https://vercel.com) → your team → **cv-app** (or the project name).
2. Go to **Settings** → **Git**.
3. Under **Connected Git Repository**, click **Disconnect** (if you want to switch repos), then **Connect Git Repository** and choose **wellis321/skin** (or your skin repo). Save.
4. Go to **Settings** → **Environment Variables**. Remove any old vars you don’t need, then add:
   - `DATABASE_URL` = your Supabase Transaction connection string; for Vercel use the **pooler host** (`aws-0-<region>.pooler.supabase.com`) and user `postgres.<project-ref>` — see [supabase-connection-string.md](./supabase-connection-string.md#for-vercel-required)
   - `ADMIN_EMAIL` = your email (for `/admin` access)
5. Go to **Deployments** → open the **⋯** on the latest deployment → **Redeploy**, or push a commit to the skin repo to trigger a new deployment.

Your existing domain (e.g. `cv-app.vercel.app`) will then serve the skin app.

## 1. Prerequisites

- Repo on GitHub: [wellis321/skin](https://github.com/wellis321/skin)
- Supabase project set up with the skin app schema (e.g. **cv-app-production**)
- Your Supabase **connection string** (use **Transaction** pooler, port 6543, for serverless)

## 2. Create the Vercel project

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. Click **Add New…** → **Project**.
3. **Import** the `wellis321/skin` repo (or “skin” from your GitHub list).
4. Vercel will detect SvelteKit. Leave **Framework Preset** as SvelteKit and **Root Directory** empty.
5. **Do not** deploy yet — add environment variables first.

## 3. Environment variables

In the project import screen (or later: **Project → Settings → Environment Variables**), add:

| Name            | Value                    | Notes                                      |
|-----------------|--------------------------|--------------------------------------------|
| `DATABASE_URL`  | Your Supabase URI        | Use **Transaction** pooler (port 6543).    |
| `ADMIN_EMAIL`   | Your email               | Only this user can access `/admin`.        |
| `RESEND_API_KEY`| (optional)               | For booking emails; leave empty to skip.   |
| `RESEND_FROM`   | (optional)               | Sender address if using Resend.            |

- Use the **same** `DATABASE_URL` as in your `.env` (Supabase Transaction URI).
- Apply to **Production** (and Preview if you want preview deployments to use the DB).

## 4. Deploy

1. Click **Deploy**.
2. Wait for the build. The first deployment may take a couple of minutes.
3. When it’s done, Vercel shows a URL like `skin-xxx.vercel.app`. That’s your shareable link.

## 5. Share for feedback

- **Production URL**: `https://your-project.vercel.app` — share this for feedback.
- **Preview URLs**: Every push to a branch gets a preview URL; you can share those for testing before merging.

## Troubleshooting

- **Build fails**: Check the build logs. Common issues: missing env vars, or Node/npm version (Vercel usually picks the right one from the repo).
- **App loads but “database error”**: Ensure `DATABASE_URL` is set and is the **Transaction** pooler URI (port 6543), not the direct connection. The app uses **postgres.js** with `prepare: false` so it works with Supabase's transaction pooler (which doesn't support prepared statements).
- **Login/register 500 with "getaddrinfo ENOTFOUND db.xxx.supabase.co"**: Vercel does not support IPv6. Your `DATABASE_URL` must use the **Supavisor pooler host** (e.g. `aws-0-eu-west-1.pooler.supabase.com`) and user `postgres.<project-ref>`, not `db.<project-ref>.supabase.co`. See [Finding your Supabase connection string](./supabase-connection-string.md#for-vercel-required).
- **Admin not accessible**: Set `ADMIN_EMAIL` to the email you use to sign in; only that user can open `/admin`.
- **Can't sign in with admin email**: You must **sign up first** on the deployed app (Register / Sign up) using that same email and a password. The production database is separate from your local one, so the account only exists after you sign up on the live site. Then sign in with that email and password. Also ensure `ADMIN_EMAIL` is set in Vercel → Project → Settings → Environment Variables (for Production and optionally Preview).
- **"Serverless Function has exceeded the unzipped maximum size of 250 MB"**: The repo uses `vercel.json` with `installCommand: "npm install --no-optional"` so TensorFlow/face-api (optional) are not installed on Vercel. Analysis still works but without face detection; if you override Install Command in the Vercel UI, keep `--no-optional`.
