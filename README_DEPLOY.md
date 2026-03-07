# Deployment Guide: Aski-MERN-Nextjs

Follow these steps to deploy your application to staging for free.

## 1. Database: MongoDB Atlas (Free Tier)

1. Sign up/Log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project and a **FREE (M0)** shared cluster.
3. In **Network Access**, add IP address `0.0.0.0/0` (for staging simplicity, restrict later if needed).
4. In **Database Access**, create a user with a password.
5. Click **Connect** -> **Drivers** (Node.js) and copy your connection string.
   - _Example_: `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/aski?retryWrites=true&w=majority`

---

## 2. Backend: Render (Free Tier)

1. Sign up/Log in at [Render](https://render.com/).
2. Create a **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Name**: `aski-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   - `MONGODB_URI`: (Your Atlas connection string)
   - `PORT`: `5000`
   - `JWT_SECRET`: (A random secure string)
   - `NODE_ENV`: `production`
6. Copy the generated URL (e.g., `https://aski-backend.onrender.com`).

---

## 3. Frontend: Vercel (Free Tier)

1. Sign up/Log in at [Vercel](https://vercel.com/).
2. Create a **New Project**.
3. Connect your GitHub repository.
4. Set the following:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
5. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: (Your Render backend URL + `/api`)
     - _Example_: `https://aski-backend.onrender.com/api`
6. Click **Deploy**.

---

## 4. Local Testing (Optional but Recommended)

To test the entire stack locally via Docker:

```bash
docker-compose up --build
```

This will start the specialized containers and a local MongoDB instance. Access the frontend at `http://localhost:3000`.

## 5. Summary of URLs

- **Frontend**: [Your Vercel URL]
- **Backend Health**: `https://your-render-url.onrender.com/health` (verify this works first!)
