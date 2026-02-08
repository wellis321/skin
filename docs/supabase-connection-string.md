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

Your strings will look like one of these (replace `[YOUR-PASSWORD]`):

- **Direct (single session, e.g. migrations):**
  ```text
  postgresql://postgres:[YOUR-PASSWORD]@db.qztsitnpzkdhyysmjapg.supabase.co:5432/postgres
  ```

- **Transaction mode (recommended for Vercel/serverless):**  
  Use the **Transaction** tab in the Connect modal and copy the URI it shows (often port **6543** and a pooler host).

Then set in `.env` (local) or Vercel env vars:

```text
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@...
```

Never commit the real password or full connection string to git.
