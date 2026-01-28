# Deployment Guide

## 1. Backend (Render)

This configuration handles your Java Spring Boot backend.

**Setup Method:**
1. Connect your GitHub repository to Render.
2. Render will automatically detect `render.yaml` and prompt you to create the service.

**Manual Configuration (if not using render.yaml):**
*   **Name:** `bloodbank-backend`
*   **Type:** Web Service
*   **Runtime:** Docker
*   **Root Directory:** `bloodbank-backend`
*   **Docker Context:** `bloodbank-backend`
*   **Dockerfile Path:** `Dockerfile` (relative to root dir)
*   **Environment Variables:**
    *   `JAVA_VERSION`: `17`
    *   `MONGODB_URI`: (Your MongoDB Connection String)
    *   `JWT_SECRET`: (A long random string)
    *   `MAIL_USERNAME`: (Your Email)
    *   `MAIL_PASSWORD`: (Your App Password)
    *   `GOOGLE_CLIENT_ID`: (Your Google Client ID)
    *   `GOOGLE_CLIENT_SECRET`: (Your Google Client Secret)
    *   `SPRING_DATA_REDIS_HOST`: (Your Valkey/Redis Host)
    *   `SPRING_DATA_REDIS_PORT`: (Your Valkey/Redis Port)
    *   `REDIS_PASSWORD`: (Your Redis Password)
    *   `TWILIO_ACCOUNT_SID`: (Your Twilio SID)
    *   `TWILIO_AUTH_TOKEN`: (Your Twilio Token)
    *   `TWILIO_PHONE_NUMBER`: (Your Twilio Phone Number)

---

## 2. Frontend (Vercel)

This configuration handles your React/Vite frontend.

**Setup Method:**
1. Go to Vercel Dashboard -> **Add New...** -> **Project**.
2. Import `BloodLink` repository.

**Project Settings:**
*   **Framework Preset:** Vite
*   **Root Directory:** `bloodbank-frontend` (Click "Edit" next to Root Directory to select this folder)
*   **Build Command:** `npm run build` (Default)
*   **Output Directory:** `dist` (Default)
*   **Install Command:** `npm install` (Default)

**Environment Variables:**
*   `VITE_BACKEND_URL`: `https://your-render-backend-url.onrender.com` (Copy this from Render after your backend is created)

**Routing Configuration:**
A `vercel.json` has been added to `bloodbank-frontend/` to ensure that refreshing pages works correctly (SPA Routing).
