# 🧊 3D Viewer Pro

A premium, state-of-the-art 3D model viewer application that allows users to upload, visualize, and annotate GLB/GLTF models with ease. This project features a sleek, modern UI, real-time material editing, and persistent viewer settings.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.182-black?logo=three.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)

---

## 🚀 Live Demo
- **Frontend:** [3-d-veiwer-hy6m.vercel.app](https://3-d-veiwer-hy6m.vercel.app)
- **Backend:** [threed-veiwer.onrender.com](https://threed-veiwer.onrender.com)

---

## ✨ Features

- **Model Uploads:** Seamlessly upload `.glb` and `.gltf` files (up to 50MB).
- **Interactive 3D Viewer:** Full orbit controls, zoom, and pan capabilities.
- **Material Presets:** Apply professional material styles like Chrome, Glass, Brushed Metal, and more.
- **Environment Lighting:** Switch between HDRI environments (Sunset, Studio, Forest, Dawn) to see how models look in different lighting.
- **Live Annotations:** Click anywhere on your model to drop a pin and add specific notes or titles.
- **Customizable UI:** Toggle wireframes, change material colors, and hide/show the ground platform.
- **Persistence:** Your viewer settings and recently uploaded models are saved automatically to the cloud.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **3D Rendering:** Three.js, @react-three/fiber, @react-three/drei
- **Styling:** Tailwind CSS v4 (Modern Zinc/Minimalist design)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **API Client:** Axios

### Backend
- **Environment:** Node.js & Express
- **Database:** MongoDB Atlas (Mongoose ODM)
- **File Handling:** Multer (Disk storage with duplicate cleaning)
- **Security:** CORS configuration for production environments

---

## 🏗️ Architecture

1.  **Client:** Built as a SPA (Single Page Application) that communicates with the REST API.
2.  **Server:** Express.js server that handles model storage (static serving) and metadata management.
3.  **Database:** Stores model metadata (original name, stored path, size) and global viewer settings (colors, environment).

---

## 📥 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/priyanshuKumar56/3D_Veiwer.git
cd 3D_Veiwer
```

### 2. Setup Server
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
CLIENT_URL=http://localhost:5173
```
Run the server:
```bash
npm run dev
```

### 3. Setup Client
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```
Run the client:
```bash
npm run dev
```

---

## 🚢 Deployment

### Frontend (Vercel)
- Set `Output Directory` to `dist`.
- Set environment variable `VITE_API_URL` to your Render backend URL.

### Backend (Render)
- Build Command: `npm install`
- Start Command: `npm start`
- Set environment variable `CLIENT_URL` to your Vercel URL.
- Ensure the `uploads/` directory is handled appropriately (Render's free tier disk is ephemeral; for production, consider S3/Cloudinary).

---

## 📄 License
This project is licensed under the ISC License. Created by [Priyanshu Kumar](https://github.com/priyanshuKumar56).
