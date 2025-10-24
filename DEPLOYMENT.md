# EventHub Deployment Guide

## Production Deployment on Render

### Backend Deployment

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Set the following:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: Node

2. **Configure Environment Variables** (in Render dashboard):
   ```
   DATABASE_URL=<your-neon-or-postgres-url>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   ENABLE_MOCK_PAYMENTS=false
   PORT=5000
   NODE_ENV=production
   ```

3. **Note your backend URL**: e.g., `https://eventhub-backend.onrender.com`

### Frontend Deployment

1. **Create a new Static Site on Render**
   - Connect the same GitHub repository
   - Set the following:
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `client/dist`

2. **Configure Environment Variables** (in Render dashboard):
   ```
   VITE_API_URL=https://eventhub-backend.onrender.com
   VITE_STRIPE_PUBLIC_KEY=<your-stripe-publishable-key>
   ```

3. **Important**: The `VITE_API_URL` must point to your backend URL from step 1

### Update CORS Configuration

After deploying, update the CORS origins in `server/index.ts`:

```typescript
app.use(
  cors({
    origin: [
      "https://your-frontend-url.onrender.com", // Replace with your actual frontend URL
      "http://localhost:5173", // Keep for local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
```

### Troubleshooting

#### 404 Errors on API Calls
- **Cause**: Frontend can't reach the backend
- **Fix**: Ensure `VITE_API_URL` environment variable is set correctly in your frontend deployment
- **Verify**: Check browser console - API calls should go to your backend URL, not relative paths

#### CORS Errors
- **Cause**: Backend doesn't allow requests from your frontend domain
- **Fix**: Update the `origin` array in `server/index.ts` with your actual frontend URL
- **Redeploy**: Backend after making CORS changes

#### Payment Errors
- **Cause**: Stripe keys not configured or mock payments enabled in production
- **Fix**: 
  - Set `ENABLE_MOCK_PAYMENTS=false` in production
  - Ensure valid Stripe keys are configured
  - Use Stripe test keys for testing, live keys for production

#### Database Connection Issues
- **Cause**: Invalid DATABASE_URL or database not accessible
- **Fix**: 
  - Verify DATABASE_URL is correct
  - Ensure database allows connections from Render IPs
  - For Neon, enable "Allow all IPs" or add Render's IP ranges

### Local Development

For local development, you don't need `VITE_API_URL` - the Vite dev server proxies API requests automatically.

Just run:
```bash
npm run dev
```

### Verification Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] `VITE_API_URL` set in frontend environment
- [ ] CORS origins updated in backend code
- [ ] Database connected successfully
- [ ] Stripe keys configured (if using real payments)
- [ ] Test event creation works
- [ ] Test booking flow works
- [ ] Check browser console for errors
