# 🚀 Deployment Guide — 3D Viewer

## Architecture

```
┌─────────────────┐     API calls     ┌──────────────────┐     DB      ┌─────────────┐
│  Vercel (Front)  │  ──────────────▶  │  Render (Back)   │  ────────▶  │ MongoDB Atlas│
│  React + Vite    │  ◀──────────────  │  Express + Node  │  ◀────────  │  Free Tier   │
└─────────────────┘                    └──────────────────┘             └─────────────┘
```

---

## Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free M0 cluster**
3. Create a database user (note the username & password)
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere)
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/3dviewer
   ```

---

## Step 2: Deploy Backend on Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `3dviewer-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | `mongodb+srv://...` (from Step 1) |
   | `CLIENT_URL` | `https://your-app.vercel.app` (update after Vercel deploy) |
   | `PORT` | `10000` (Render default) |

6. Click **Deploy** — note the URL: `https://3dviewer-api.onrender.com`

> ⚠️ **Important**: Render free tier has ephemeral disk. Uploaded 3D models will be lost on redeploy. For production, use cloud storage (AWS S3 / Cloudinary).

---

## Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://3dviewer-api.onrender.com` (your Render URL) |

5. Click **Deploy**
6. Note your Vercel URL: `https://your-app.vercel.app`

---

## Step 4: Update CORS on Render

After Vercel deploys, go back to Render and update:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | `https://your-app.vercel.app` |

You can add multiple origins separated by commas:
```
https://your-app.vercel.app,https://custom-domain.com
```

---

## Local Development

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` with Vite proxy forwarding `/api` and `/uploads` to `http://localhost:5000`.

---

## Environment Variables Quick Reference

### Client (`client/.env`)
```env
VITE_API_URL=           # Empty for local (uses Vite proxy)
                         # Set to Render URL for production
```

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/3dviewer
CLIENT_URL=http://localhost:5173
```
