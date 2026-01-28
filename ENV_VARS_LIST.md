# Environment Variables Checklist

## 1. Backend (Render Environment)
Add these strictly in the "Environment" tab of your Render Service.

| Key | Value Description (What you need to paste) |
| :--- | :--- |
| `JAVA_VERSION` | `17` |
| `MONGODB_URI` | Your full MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/...`) |
| `JWT_SECRET` | A long, random string (e.g., `4v3ryL0ngAndS3cr3tR4nd0mStr1ngThatIsH4rdToGu3ss!`) |
| `MAIL_USERNAME` | Your email address (e.g., `your.email@gmail.com`) |
| `MAIL_PASSWORD` | Your Google App Password (16 characters, no spaces) |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID (ends in `.apps.googleusercontent.com`) |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `REDIS_PASSWORD` | Your Redis/Valkey Password |
| `SPRING_DATA_REDIS_HOST` | Hostname of your Redis server (e.g., `valkey-xxx.aivencloud.com`) |
| `SPRING_DATA_REDIS_PORT` | Port of your Redis server (e.g., `14482`) |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number (format: `+1234567890`) |

> **Note:** Do NOT add `PORT` or `server.port`. Render provides this automatically.
no please give
---

## 2. Frontend (Vercel Environment)
Add these in the "Settings" -> "Environment Variables" section of your Vercel Project.

| Key | Value Description |
| :--- | :--- |
| `VITE_BACKEND_URL` | Your **Render Backend URL** (e.g., `https://bloodbank-backend.onrender.com`). **Do not add a trailing slash `/` or `/api`**. |
