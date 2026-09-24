# Deploying to Vercel

The whole project deploys as **one Vercel project**:

- `frontend/` is built by Vite and served as static files.
- `backend/` runs as a Node serverless function, exposed at `/api/*` via `api/index.js`.
- Because the API is on the same origin as the app, there is no CORS setup needed.

```
GitHub repo
   └── Vercel project
         ├── frontend/dist  →  static site (https://your-app.vercel.app)
         └── api/index.js   →  serverless function (https://your-app.vercel.app/api/*)
```

---

## 1. Create the database (MongoDB Atlas)

Vercel's servers cannot reach `localhost:27017`, so the demo's local MongoDB must be
replaced with a cloud one. Atlas has a free M0 tier.

1. Sign up at <https://www.mongodb.com/atlas> and create a free **M0** cluster.
2. **Database Access** → add a database user (username + password). Save the password.
3. **Network Access** → add IP address `0.0.0.0/0` (allow from anywhere). Vercel
   functions have no fixed IP, so this is required.
4. **Connect → Drivers → Node.js** and copy the connection string:

   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/gym_management_demo?retryWrites=true&w=majority
   ```

   Replace `<password>` with the real password, and keep `/gym_management_demo`
   before the `?` so the app writes to its own database.

## 2. Push the project to GitHub

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push
```

## 3. Import the project in Vercel

1. Go to <https://vercel.com/new> and import the repository.
2. Leave **Framework Preset** on *Other*, and **leave Root Directory as the repo root**
   — `vercel.json` already defines the install command, build command and output
   directory. Do not override them.

## 4. Add environment variables

In **Project → Settings → Environment Variables** add these for *Production*,
*Preview* and *Development*:

| Name           | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| `MONGO_URI`    | the Atlas connection string from step 1                                |
| `JWT_SECRET`   | any long random string (e.g. output of `openssl rand -hex 32`)         |
| `JWT_EXPIRES_IN` | `7d`                                                                 |
| `CLIENT_URL`   | `https://your-app.vercel.app` (add the preview domain too if needed)   |
| `NODE_ENV`     | `production`                                                           |

`CLIENT_URL` accepts a comma-separated list, e.g.
`https://your-app.vercel.app,https://your-app-git-main-you.vercel.app`.

## 5. Deploy and verify

Deploy, then check the API:

```bash
curl https://your-app.vercel.app/api/health
# {"success":true,"message":"Gym Management API is running"}
```

Open the app and sign in with a demo account (the database seeds itself on the
first request if it is empty):

| Role        | Email                     | Password     |
| ----------- | ------------------------- | ------------ |
| Super Admin | `admin@gymdemo.com`       | `Admin@123`  |
| Gym Owner   | `owner@gymdemo.com`       | `Owner@123`  |
| Manager     | `manager@gymdemo.com`     | `Manager@123`|
| Trainer     | `trainer@gymdemo.com`     | `Trainer@123`|

---

## How the wiring works

- `api/index.js` — the serverless entrypoint. It opens the MongoDB connection once
  per warm instance, seeds the demo data if the database is empty, and hands the
  request to the Express app.
- `backend/app.js` — the Express app (routes only, no `listen`), shared by both
  targets.
- `backend/server.js` — the local dev server; still runs on `http://localhost:5000`.
- `backend/config/db.js` — caches the Mongoose connection on the Node global so
  repeated function invocations reuse one pool instead of exhausting Atlas' limit.
- `vercel.json` — builds `frontend/` into `frontend/dist`, routes `/api/*` to the
  function, and falls back to `index.html` for React Router paths.

## Local development (unchanged)

```bash
npm install            # API dependencies for the serverless function
npm install --prefix backend
npm install --prefix frontend

npm run seed           # seed local MongoDB (optional)
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

To reproduce the production setup locally, run `npx vercel dev` (it uses
`vercel.json` and reads `backend/.env`).

## Notes

- Serverless functions have a cold start of a second or two on the free plan.
- The connection-caching logic assumes relatively steady traffic; for very low
  traffic Atlas may close idle connections, which the driver reopens automatically.
- Never commit `backend/.env` — it is gitignored, and Vercel uses the dashboard
  environment variables instead.
