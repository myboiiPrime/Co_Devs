# 🚀 Render Deployment Checklist

## ✅ Pre-Deployment Verification

### Backend Configuration
- [x] Environment variables properly configured in `.env`
- [x] CORS origins include environment-based CLIENT_URL
- [x] Database connection uses MONGODB_URI environment variable
- [x] JWT_SECRET configured for production security
- [x] Health check endpoint available at `/api/health`
- [x] Socket.io CORS properly configured
- [x] Terminal close functionality fixed (`destroyTerminal` method)

### Frontend Configuration
- [x] API base URL uses environment variable `VITE_API_BASE_URL`
- [x] Production environment file configured
- [x] Build script available (`npm run build`)
- [x] Socket connection uses dynamic URL from environment

### Deployment Files
- [x] `render.yaml` configured with both services
- [x] Backend service configured with health check
- [x] Frontend service configured as static site
- [x] Environment variables properly linked between services

## 🔧 Manual Configuration Required in Render Dashboard

### Backend Service Environment Variables
Set these manually in Render dashboard for security:

```
MONGODB_URI=mongodb+srv://thangtobo4058:8wJtcfgD0W6i7fGS@userbase.ttbcnq1.mongodb.net/collaborative-editor?retryWrites=true&w=majority&appName=userbase
JWT_SECRET=collaborative-editor-super-secret-jwt-key-2024-school-project
GEMINI_API_KEY=AIzaSyA7A85NaSkdylswgsJ3n0HvLDJ5HuvilpU
```

### Automatic Environment Variables (from render.yaml)
- `NODE_ENV=production`
- `PORT=5000`
- `JWT_EXPIRE=7d`
- `CLIENT_URL` (automatically set from frontend service URL)
- `RENDER_DEPLOYMENT=true`
- `MAX_TERMINALS_PER_SESSION=3`
- `TERMINAL_TIMEOUT_MS=1800000`

### Frontend Service Environment Variables
- `VITE_API_BASE_URL` (automatically set from backend service URL)
- `VITE_NODE_ENV=production`

## 🚀 Deployment Steps

1. **Push to GitHub**: Ensure all code is committed and pushed
2. **Connect to Render**: Link your GitHub repository
3. **Deploy with render.yaml**: Render will automatically detect and deploy both services
4. **Set Manual Environment Variables**: Add the secure environment variables in Render dashboard
5. **Test Deployment**: Verify both services are running and connected

## 🧪 Post-Deployment Testing

### Backend Health Check
```
GET https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Collaborative Code Editor API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "features": {
    "collaboration": true,
    "terminals": true,
    "fileSystem": true,
    "ai": true
  }
}
```

### Frontend Access
- Visit: `https://your-frontend-url.onrender.com`
- Test user registration/login
- Test session creation and joining
- Test real-time collaboration
- Test terminal functionality
- Test AI chat features

### WebSocket Connection
- Check browser console for connection errors
- Test real-time features (typing, cursor movement)
- Test terminal creation and interaction

## 🔍 Troubleshooting

### Common Issues:
1. **Services not connecting**: Check environment variables
2. **CORS errors**: Verify CLIENT_URL is set correctly
3. **Database connection**: Ensure MONGODB_URI is correct
4. **WebSocket issues**: Check if both services are running
5. **Build failures**: Check Node.js version compatibility

### Logs to Check:
- Backend service logs in Render dashboard
- Frontend build logs
- Browser console for client-side errors

## 📝 Notes
- Free tier services may sleep after 15 minutes of inactivity
- First request after sleep may be slow (cold start)
- Consider upgrading to paid plans for production use
- Monitor resource usage in Render dashboard