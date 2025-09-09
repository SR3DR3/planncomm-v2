# 🚀 PlannComm v2 - Online Deployment Steps

## Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `planncomm-v2`
   - Description: `PlannComm v2 - Accounting Planning Software Prototype`
   - Keep it **Public** (for free deployments)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

2. **Push your code:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/planncomm-v2.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render.com

1. **Go to https://render.com**
2. **Sign up/Login** (can use GitHub account)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository:** `planncomm-v2`
5. **Configure the service:**
   - **Name:** `planncomm-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `planncomm-backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. **Advanced Settings:**
   - **Environment Variables:**
     - `NODE_ENV` = `production`
     - `PORT` = `10000`
7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy the URL** (e.g., `https://planncomm-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. **Go to https://vercel.com**
2. **Sign up/Login** (can use GitHub account)
3. **Click "New Project"**
4. **Import your GitHub repository:** `planncomm-v2`
5. **Configure the project:**
   - **Project Name:** `planncomm-frontend`
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `planncomm-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
6. **Environment Variables:**
   - `REACT_APP_API_URL` = `https://planncomm-backend.onrender.com` (from Step 2)
7. **Click "Deploy"**
8. **Wait for deployment** (2-5 minutes)
9. **Get your URL** (e.g., `https://planncomm-frontend.vercel.app`)

## Step 4: Update Frontend API URLs

After backend is deployed, update frontend to use production API:

1. **Edit `planncomm-frontend/src/config.ts`:**
```typescript
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://planncomm-backend.onrender.com'
};
```

2. **Update all components to use config.apiUrl instead of localhost**
3. **Commit and push changes**
4. **Vercel will auto-redeploy**

## Step 5: Test Your Live Demo

1. **Frontend URL:** `https://planncomm-frontend.vercel.app`
2. **Backend API:** `https://planncomm-backend.onrender.com/api/tasks`
3. **Test all features:**
   - Dashboard shows 382 tasks
   - Task creation works
   - Excel export works
   - Filters work
   - Company overview works

## 🎯 Your Demo URLs:

- **Live Demo:** https://planncomm-frontend.vercel.app
- **GitHub:** https://github.com/YOUR_USERNAME/planncomm-v2
- **API Health:** https://planncomm-backend.onrender.com/api/health

## 📱 Mobile-Ready:

Your app will work on:
- Desktop browsers
- Tablets
- Mobile phones
- Any device with internet

## ⏱️ Total Time: ~20 minutes

## 💡 Demo Tips:

1. **Open on any device:** Just share the URL
2. **Professional presentation:** No localhost needed
3. **Real-time updates:** Changes deploy automatically
4. **Always available:** 24/7 access for your boss
5. **Free hosting:** No costs involved

---
**Your PlannComm v2 prototype is now live and ready to impress!** 🚀
