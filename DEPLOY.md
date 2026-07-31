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

The backend accepts files up to **20 MB each**, max **20 files per request**. If your hosting provider has a lower request body limit (e.g., Vercel has 4.5 MB on hobby plans), host the backend on AWS App Runner, Railway, or a VPS instead.

---

## ☁️ AWS Deployment (Best & Lowest-Cost Architecture)

This section details how to deploy the entire application on **Amazon Web Services (AWS)** for **$0 to ~$3.50/month** (using AWS Free Tier & Serverless/Low-Cost Services).

```
 ┌──────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────┐
 │ AWS CloudFront (CDN) │ ───► │   AWS S3 (Static Bucket) │      │ MongoDB Atlas (Free)│
 │  HTTPS / Global Edge │      │  Frontend React App     │      │   Database Cluster  │
 └──────────┬───────────┘      └─────────────────────────┘      └──────────▲──────────┘
            │                                                              │
            └───────────────────────── API Calls ──────────────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │   AWS App Runner /  │
                                │ AWS Lambda / Lightsail│
                                │   (Node.js Backend) │
                                └─────────────────────┘
```

---

### Step 1 — Frontend Deployment: AWS S3 + CloudFront ($0.00/mo)

**Why S3 + CloudFront?**
- **Cost**: $0.00 (AWS Free Tier includes 5 GB S3 storage & 1 TB/month CloudFront data transfer).
- **Performance**: Instant global edge caching with automated SSL certificates via AWS Certificate Manager (ACM).

#### Instructions:
1. **Build Frontend Bundle**:
   ```bash
   cd frontend
   VITE_API_URL=https://your-backend-api-url.awsapprunner.com/api npm run build
   ```
2. **Create S3 Bucket**:
   - Go to AWS S3 Console → **Create bucket** (e.g., `tritorc-frontend-prod`).
   - Enable **Static Website Hosting** in bucket properties.
   - Upload the contents of `frontend/dist/` to the bucket.
3. **Set Up CloudFront Distribution**:
   - Go to AWS CloudFront → **Create Distribution**.
   - Set **Origin Domain** to your S3 bucket website endpoint.
   - Set **Viewer Protocol Policy** to *Redirect HTTP to HTTPS*.
   - In **Custom Error Responses**, add a 404 rule directing to `/index.html` with status 200 (for React single-page routing).
   - Note your CloudFront URL: `https://d12345abcdef.cloudfront.net`.

---

### Step 2 — Backend Deployment: AWS App Runner, Lightsail, or EC2

Choose between these cost-effective options:

#### Option A: AWS App Runner (Recommended — Auto-Scales & Pauses when Idle — ~$0–$5/mo)
*App Runner automatically builds containers from GitHub and pauses CPU when idle.*

1. Push code to GitHub.
2. Go to AWS App Runner Console → **Create Service**.
3. Source: Select **Source code repository** → Connect GitHub → Select `backend/` directory.
4. Deployment settings:
   - **Runtime**: Node.js 18 or Docker
   - **Build Command**: `npm install`
   - **Start Command**: `node src/app.js`
   - **Port**: `5000`
5. Environment Variables:
   - `FRONTEND_URL` = `https://d12345abcdef.cloudfront.net` (your CloudFront domain)
   - `MONGODB_URI` = `mongodb+srv://...`
   - `NODE_ENV` = `production`
6. Deploy service. Note the assigned API endpoint: `https://xxxxxx.us-east-1.awsapprunner.com`.

---

#### Option B: AWS EC2 (t4g.nano / t3.micro — Manual Virtual Machine)
*Use this if you prefer a traditional Linux virtual machine.*

1. Go to **AWS EC2 Console** → **Launch Instance**.
2. Select **Ubuntu 22.04 LTS** (AMI) and `t4g.nano` (ARM, ~$3.00/mo) or `t3.micro` (Free Tier eligible for 12 months).
3. Configure Security Group:
   - Allow **HTTP (80)**, **HTTPS (443)**, **SSH (22)**, and custom port **5000**.
4. Connect via SSH and run deployment commands:
   ```bash
   # Install Node.js 20 & Git
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   sudo npm install -g pm2

   # Clone project & setup backend
   git clone https://github.com/YourUser/Tritorc.git
   cd Tritorc/backend
   npm install --production

   # Create environment variables
   nano .env
   # Add: PORT=5000, FRONTEND_URL=https://your-cloudfront-domain.cloudfront.net, MONGODB_URI=...

   # Run via PM2 process manager
   pm2 start src/app.js --name "tritorc-backend"
   pm2 save
   pm2 startup
   ```

---

### ❓ Why App Runner / Serverless is Preferred over Raw EC2

| Feature | AWS App Runner / Serverless | AWS EC2 (Virtual Machine) |
|---|---|---|
| **Idle Cost** | **$0.00** (Pauses CPU when no traffic) | **$8–$12/mo** (Always running 24/7) |
| **SSL / HTTPS** | Auto-generated free SSL certificate | Manual Certbot / Nginx config required |
| **DevOps Overhead** | Zero OS maintenance or patching | Must update Linux packages & security patches |
| **Auto-Scaling** | Automatic (0 to N instances) | Manual Auto Scaling Group (ASG) setup |

---

### Step 3 — Database Deployment: MongoDB Atlas Free M0 ($0.00/mo)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (or your EC2/App Runner IP).
3. Under **Database Access**, create a user/password.
4. Copy the connection string into the `MONGODB_URI` environment variable of your backend.

---

### AWS Cost & Architecture Summary

| Component | AWS Service | Estimated Monthly Cost | Free Tier Eligible |
|---|---|---|:---:|
| **Frontend** | S3 + CloudFront CDN | **$0.00** | ✅ (1 TB bandwidth free) |
| **Backend** | App Runner (auto-pause) or EC2 | **$0.00 – $3.50** | ✅ (750 hrs free) |
| **Database** | MongoDB Atlas Shared M0 | **$0.00** | ✅ (512 MB storage free) |
| **Total** | **End-to-End Stack** | **$0.00 – $3.50 / month** | **100% Free Tier Friendly** |


