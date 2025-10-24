# 🚀 Quick Fix for Production Errors

## The Problem
- ❌ API returns 404 errors
- ❌ "Unexpected end of JSON input" error
- ❌ Events not loading in production

## The Solution (2 Steps)

### Step 1: Add Environment Variables to Frontend (Render Static Site)

Go to your **Frontend** deployment in Render → Environment tab → Add:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

**Example**:
```
VITE_API_URL=https://eventhub-backend-abc123.onrender.com
```

### Step 2: Add Environment Variable to Backend (Render Web Service)

Go to your **Backend** deployment in Render → Environment tab → Add:

```
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Example**:
```
FRONTEND_URL=https://eventhub-frontend-xyz789.onrender.com
```

## That's It!

Both services will auto-redeploy after adding environment variables.

Wait 2-3 minutes for deployment to complete, then test your app.

## How to Verify It Works

1. Open your frontend URL in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Refresh the page
5. Look for API requests - they should:
   - ✅ Start with your backend URL
   - ✅ Return 200 status
   - ✅ Show no CORS errors

## Still Not Working?

### Check Your URLs
- Backend URL should NOT have trailing slash: ✅ `https://backend.com` ❌ `https://backend.com/`
- Frontend URL should NOT have trailing slash: ✅ `https://frontend.com` ❌ `https://frontend.com/`

### Check Render Logs
1. Go to Render dashboard
2. Click on your backend service
3. Click "Logs" tab
4. Look for errors

### Test Backend Directly
Open in browser: `https://your-backend-url.onrender.com/api/events`

Should see JSON like:
```json
[
  {
    "id": "...",
    "title": "...",
    ...
  }
]
```

If you see HTML or 404, your backend isn't running correctly.

## Need Full Guide?

See `RENDER_SETUP.md` for complete step-by-step instructions.
