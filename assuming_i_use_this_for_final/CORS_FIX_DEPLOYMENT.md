# 🔧 CORS Fix Deployment Guide

## 🚨 **Issue Identified**
Your client at `https://co-devs-front.onrender.com` is being blocked by CORS when trying to access the server at `https://co-devs.onrender.com`.

## ✅ **Fixes Applied**

### 1. **Updated Server Environment**
- Fixed `CLIENT_URL` in `.env.production` to match actual client URL
- Enhanced CORS configuration with proper headers and methods

### 2. **Updated Client Environment**
- Set correct `VITE_API_BASE_URL` to point to server

### 3. **Updated render.yaml**
- Service names now match your actual deployment
- Environment variables properly linked between services

## 🚀 **Deployment Steps**

### **Option 1: Quick Fix (Recommended)**
Update the environment variable in Render dashboard:

1. Go to your **server service** (`co-devs`) in Render dashboard
2. Navigate to **Environment** tab
3. Update or add:
   ```
   CLIENT_URL=https://co-devs-front.onrender.com
   ```
4. **Deploy** the server service

### **Option 2: Full Redeploy**
1. **Commit and push** all changes to GitHub
2. **Redeploy** both services in Render
3. **Verify** environment variables are set correctly

## 🧪 **Testing**

After deployment, test these endpoints:

### **Server Health Check**
```
GET https://co-devs.onrender.com/api/health
```

### **CORS Test**
Open browser console on `https://co-devs-front.onrender.com` and run:
```javascript
fetch('https://co-devs.onrender.com/api/health')
  .then(response => response.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(error => console.error('❌ CORS still blocked:', error));
```

## 🔍 **Environment Variables Summary**

### **Server (`co-devs`)**
```bash
NODE_ENV=production
PORT=5000
CLIENT_URL=https://co-devs-front.onrender.com
MONGODB_URI=mongodb+srv://... (set manually)
JWT_SECRET=... (set manually)
GEMINI_API_KEY=... (set manually)
JWT_EXPIRE=7d
RENDER_DEPLOYMENT=true
MAX_TERMINALS_PER_SESSION=3
TERMINAL_TIMEOUT_MS=1800000
```

### **Client (`co-devs-front`)**
```bash
VITE_API_BASE_URL=https://co-devs.onrender.com
VITE_NODE_ENV=production
```

## 🎯 **Expected Result**

After applying these fixes:
- ✅ No more CORS errors
- ✅ Client can communicate with server
- ✅ API calls work properly
- ✅ Real-time features function correctly

## 🆘 **If Issues Persist**

1. **Check Render logs** for both services
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly
4. **Check browser network tab** for detailed error messages

---
