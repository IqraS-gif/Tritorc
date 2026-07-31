# Deployment Guide — Tritorc Relevance Checker

This guide covers deploying the frontend and backend to production.

---

## Backend Deployment (Node.js / Express)

### Option A — Railway (recommended)

1. Push `backend/` to a GitHub repository
2. Create a new project on [railway.app](https://railway.app)
3. Connect your repository → select the `backend` root directory
4. Set environment variables (see table below)
5. Railway auto-detects Node.js and runs `npm start`

### Option B — Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect repository, set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `npm start`

### Option C — VPS / Docker

```dockerfile
# backend/Dockerfile (create if needed)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["node", "src/app.js"]
```

```bash
docker build -t tritorc-backend ./backend
docker run -p 5000:5000 --env-file backend/.env tritorc-backend
```

---

## Backend Environment Variables

Set these in your hosting provider's dashboard or in a `.env` file:

| Variable | Required | Example Value | Description |
|----------|----------|---------------|-------------|
| `PORT` | No | `5000` | Server port (host may override) |
| `FRONTEND_URL` | **Yes** | `https://tritorc-checker.vercel.app` | Allowed CORS origin (your deployed frontend URL) |
| `NODE_ENV` | No | `production` | Set to `production` for performance |

---

## Frontend Deployment (React + Vite)

### Option A — Vercel (recommended)

1. Push `frontend/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api`
5. Deploy — Vercel runs `npm run build` automatically

### Option B — Netlify

1. Connect repository on [netlify.com](https://netlify.com)
2. Set **Base Directory** to `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.example.com/api`

### Option C — Static Hosting (S3, GitHub Pages)

```bash
cd frontend
VITE_API_URL=https://your-backend.example.com/api npm run build
# Upload dist/ folder to your static host
```

---

## Frontend Environment Variables

| Variable | Required | Example Value | Description |
|----------|----------|---------------|-------------|
| `VITE_API_URL` | **Yes** (production) | `https://api.tritorc.example.com/api` | Backend API base URL. Falls back to `/api` (Vite proxy) in development. |

> ⚠️ **Important**: All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser bundle.

---

## Production API URL Setup

In development, the Vite proxy (`vite.config.js`) forwards `/api/*` to `http://localhost:5000`, so no `VITE_API_URL` is needed locally.

In production:
1. Deploy the backend first and note its URL (e.g., `https://tritorc-api.railway.app`)
2. Set `VITE_API_URL=https://tritorc-api.railway.app/api` in the frontend deployment
3. Set `FRONTEND_URL=https://tritorc-checker.vercel.app` in the backend deployment (for CORS)

---

## CORS Configuration

The backend allows only the origin specified by `FRONTEND_URL`. If you deploy to multiple origins, extend the `allowedOrigins` array in `backend/src/app.js`.

---

## Health Check

After deployment, verify the backend is running:

```
GET https://your-backend.example.com/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Tritorc Relevance Checker API",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## File Size Limits

The backend accepts files up to **20 MB each**, max **20 files per request**. If your hosting provider has a lower request body limit (e.g., Vercel has 4.5 MB on hobby plans), host the backend on Railway or a VPS instead.
