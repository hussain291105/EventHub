# Quick Render Deployment Setup

## Step 1: Deploy Backend First

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `eventhub-backend` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. Add Environment Variables:
   ```
   DATABASE_URL=<your-postgres-url>
   STRIPE_SECRET_KEY=<your-stripe-secret>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable>
   ENABLE_MOCK_PAYMENTS=false
   PORT=5000
   NODE_ENV=production
   ```

6. Click **"Create Web Service"**
7. **COPY YOUR BACKEND URL**: e.g., `https://eventhub-backend-abc123.onrender.com`

## Step 2: Deploy Frontend

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `eventhub-frontend` (or your choice)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=<YOUR-BACKEND-URL-FROM-STEP-1>
   VITE_STRIPE_PUBLIC_KEY=<your-stripe-publishable-key>
   ```
   
   **Example**:
   ```
   VITE_API_URL=https://eventhub-backend-abc123.onrender.com
   VITE_STRIPE_PUBLIC_KEY=pk_test_51HvLTLGqy8r2deQO...
   ```

5. Click **"Create Static Site"**
6. **COPY YOUR FRONTEND URL**: e.g., `https://eventhub-frontend-xyz789.onrender.com`

## Step 3: Update Backend CORS

1. Go back to your **Backend Web Service** in Render
2. Add one more environment variable:
   ```
   FRONTEND_URL=<YOUR-FRONTEND-URL-FROM-STEP-2>
   ```
   
   **Example**:
   ```
   FRONTEND_URL=https://eventhub-frontend-xyz789.onrender.com
   ```

3. Click **"Save Changes"** - this will trigger a redeploy

## Step 4: Verify Deployment

1. Open your frontend URL in a browser
2. Open browser DevTools (F12) → Console tab
3. Try creating an event or browsing events
4. Check for errors:
   - ❌ **404 errors on `/api/events`**: `VITE_API_URL` not set correctly in frontend
   - ❌ **CORS errors**: `FRONTEND_URL` not set correctly in backend
   - ✅ **No errors**: Everything is working!

## Common Issues & Fixes

### Issue: "Failed to load resource: 404" on API calls

**Cause**: Frontend can't find the backend

**Fix**: 
1. Check frontend environment variables in Render
2. Ensure `VITE_API_URL` is set to your backend URL
3. Redeploy frontend after adding the variable

### Issue: CORS Error

**Cause**: Backend doesn't allow requests from frontend domain

**Fix**:
1. Check backend environment variables in Render
2. Ensure `FRONTEND_URL` is set to your frontend URL
3. Redeploy backend after adding the variable

### Issue: "Unexpected end of JSON input"

**Cause**: API request failed (404/500) and returned HTML instead of JSON

**Fix**: 
1. Check backend logs in Render dashboard
2. Verify database connection (DATABASE_URL)
3. Ensure backend is running without errors

### Issue: Database Connection Failed

**Cause**: Invalid DATABASE_URL or database not accessible

**Fix**:
1. If using Neon/Supabase: Enable "Allow all IPs" in database settings
2. Verify DATABASE_URL format: `postgresql://user:pass@host:5432/db`
3. Check backend logs for specific error messages

## Testing Locally After Deployment

To test with production backend locally:

1. Create `client/.env.local`:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. Run: `npm run dev`

3. Your local frontend will now use the production backend

## Environment Variables Summary

### Backend (Web Service)
```
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
ENABLE_MOCK_PAYMENTS=false
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend (Static Site)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Need Help?

Check the full deployment guide: `DEPLOYMENT.md`
