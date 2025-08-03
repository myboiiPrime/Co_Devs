# Deployment Guide for Collaborative IDE

This guide will help you deploy your collaborative IDE application to Render with separate server and client services.

## Prerequisites

1. GitHub repository with your code
2. Render account (free tier available)
3. MongoDB Atlas account (for database)

## Deployment Steps

### Option 1: Automatic Deployment with render.yaml (Recommended)

1. **Push your code to GitHub** with the `render.yaml` file in the root directory

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Set Environment Variables:**
   - In the server service settings, manually add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT signing

4. **Deploy:**
   - Render will automatically deploy both services
   - The client will automatically get the server URL
   - The server will automatically get the client URL for CORS

### Option 2: Manual Deployment

#### Server Deployment

1. **Create Web Service:**
   - Service Type: Web Service
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node

2. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRE=7d
   CLIENT_URL=<your-client-url-after-deployment>
   ```

#### Client Deployment

1. **Create Static Site:**
   - Build Command: `cd client/vue-project && npm install && npm run build`
   - Publish Directory: `client/vue-project/dist`

2. **Environment Variables:**
   ```
   VITE_API_BASE_URL=<your-server-url>
   VITE_NODE_ENV=production
   ```

## Configuration Files Created

### Client Configuration
- `.env` - Development environment variables
- `.env.production` - Production environment variables
- `src/config/api.js` - API configuration with environment-based URLs

### Server Configuration
- `.env` - Development environment variables
- `.env.production` - Production environment variables
- Updated `server.js` with dynamic CORS configuration

### Deployment Configuration
- `render.yaml` - Render Blueprint for automatic deployment

## Important Notes

1. **Environment Variables:** 
   - Update the placeholder URLs in `.env.production` files with your actual Render URLs
   - Keep sensitive variables (MONGODB_URI, JWT_SECRET) secure

2. **CORS Configuration:**
   - The server now dynamically allows the client URL based on CLIENT_URL environment variable
   - Both localhost and production URLs are supported

3. **API Endpoints:**
   - All hardcoded localhost URLs have been replaced with environment-based configuration
   - The application will work in both development and production environments

4. **Database:**
   - Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) for Render deployment
   - Or whitelist Render's IP ranges

## Testing Deployment

1. **Server Health Check:**
   ```
   GET https://your-server-url.onrender.com/api/health
   ```

2. **Client Access:**
   ```
   https://your-client-url.onrender.com
   ```

3. **WebSocket Connection:**
   - Test real-time collaboration features
   - Check browser console for connection errors

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Verify CLIENT_URL in server environment variables
   - Check that client URL is correctly set

2. **API Connection Errors:**
   - Verify VITE_API_BASE_URL in client environment variables
   - Ensure server service is running

3. **Database Connection:**
   - Check MongoDB Atlas connection string
   - Verify network access settings in MongoDB Atlas

4. **Build Failures:**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

## Production URLs Structure

After deployment, your URLs will look like:
- Server: `https://collaborative-ide-server.onrender.com`
- Client: `https://collaborative-ide-client.onrender.com`

Update your environment files with these actual URLs once deployed.

## Security Considerations

1. **Environment Variables:**
   - Never commit sensitive variables to version control
   - Use Render's environment variable management

2. **JWT Secret:**
   - Use a strong, random JWT secret in production
   - Different from development secret

3. **Database Security:**
   - Use MongoDB Atlas with proper authentication
   - Restrict network access when possible

## Performance Notes

1. **Free Tier Limitations:**
   - Services may sleep after 15 minutes of inactivity
   - First request after sleep may be slow (cold start)

2. **Optimization:**
   - Consider upgrading to paid plans for production use
   - Monitor resource usage in Render dashboard

## Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for frontend errors