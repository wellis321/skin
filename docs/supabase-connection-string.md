# Finding your Supabase connection string

Per [Supabase: Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler):

## Where to get it

1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (**cv-app-production**).
3. **Click the "Connect" button at the top of the page** (not inside Project Settings).
4. In the modal you’ll see connection options:
   - **URI** – copy the connection string.
   - You can switch between **Session** (port 5432) and **Transaction** (port 6543) pooler; for **Vercel/serverless use Transaction mode** (port 6543).
5. Replace `[YOUR-PASSWORD]` in the string with your **database password**.

## If you don’t know the database password

1. In the dashboard: **Project Settings** (gear icon in the left sidebar).
2. Open **Database**.
3. Under **Database password**, use **Reset database password** to set a new one (save it somewhere safe).

## For this project (cv-app-production)

- **Project ref:** `qztsitnpzkdhyysmjapg`
- **Region:** `eu-west-1`

### For Vercel (required)

Vercel does **not** support IPv6 for outbound connections. The host `db.*.supabase.co` uses IPv6 and will cause **ENOTFOUND** or connection failures on Vercel. You **must** use the **Supavisor** pooler host (IPv4):

- **Transaction mode (Vercel / serverless):** host `aws-0-eu-west-1.pooler.supabase.com`, user `postgres.qztsitnpzkdhyysmjapg`, port **6543**

  ```text
  postgres://postgres.qztsitnpzkdhyysmjapg:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
  ```

  In the Supabase Connect modal, open the **Transaction** tab and copy the URI; it should show this pooler host and `postgres.<project-ref>` user. Replace the password placeholder with your database password. Encode any special characters in the password (e.g. `?` → `%3F`).  
  **If you see "password authentication failed for user postgres"** on Vercel, the username in `DATABASE_URL` is wrong: it must be `postgres.qztsitnpzkdhyysmjapg` (with the dot and project ref), not plain `postgres`.

### Other environments

- **Direct (single session, e.g. migrations / local):**
  ```text
  postgresql://postgres:[YOUR-PASSWORD]@db.qztsitnpzkdhyysmjapg.supabase.co:5432/postgres
  ```

- **Transaction with db host (IPv6; do not use on Vercel):**  
  If the Connect modal shows `db.qztsitnpzkdhyysmjapg.supabase.co:6543`, that will fail on Vercel. Use the pooler host above instead.

Then set in `.env` (local) or Vercel env vars:

```text
DATABASE_URL=postgres://postgres.qztsitnpzkdhyysmjapg:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

Never commit the real password or full connection string to git.
