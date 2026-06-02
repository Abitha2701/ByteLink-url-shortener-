# Deployment Checklist & Guide

## Pre-Deployment Checklist

### Code Quality & Security
- [ ] All secrets removed from codebase (no API keys, passwords, tokens)
- [ ] `.env` file added to `.gitignore`
- [ ] Helmet security headers configured
- [ ] CORS properly configured for production domain
- [ ] Rate limiting enabled
- [ ] Input validation on all routes
- [ ] Error handling covers all edge cases
- [ ] No console.log statements in production code (use logger)
- [ ] All dependencies up to date: `npm audit`
- [ ] Dependencies remove test/dev packages from production build

### Database & Performance
- [ ] MongoDB indexes created: `db.createIndex()` for shortCode, user, timestamp
- [ ] Connection pooling configured (Mongoose handles this)
- [ ] Database backup strategy in place
- [ ] Query optimization verified (use .explain() for slow queries)
- [ ] Database user created with minimal permissions
- [ ] Connection string uses strong password (24+ characters)

### Frontend Optimization
- [ ] Vite build verified: `npm run build`
- [ ] Bundle size acceptable (target: <500KB gzipped)
- [ ] No console errors/warnings in production build
- [ ] Service worker/offline support (if applicable)
- [ ] Analytics code correctly points to production API
- [ ] API base URL correctly configured for production

### Environment Configuration
- [ ] `.env.example` created with all required variables
- [ ] All environment variables documented
- [ ] `NODE_ENV=production` set in deployment
- [ ] Logging level appropriate for production (`info` level)
- [ ] Error tracking (Sentry/Rollbar) configured if using

---

## Deployment Guides

### Option 1: Docker Deployment (Recommended)

#### Using Docker Compose (Local/Dev Server)

1. **Ensure Docker is installed**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Create environment file**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB Atlas URI and JWT secret
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Verify containers are running**
   ```bash
   docker-compose ps
   docker-compose logs backend
   ```

5. **Check health endpoints**
   ```bash
   curl http://localhost:4000/api/health
   curl http://localhost:5173  # Frontend
   ```

6. **Stop services**
   ```bash
   docker-compose down
   # Remove volumes: docker-compose down -v
   ```

#### Using Docker Hub (Production)

1. **Build and tag image**
   ```bash
   docker build -t your-username/bytelink-backend:1.0.0 .
   docker build -t your-username/bytelink-frontend:1.0.0 ./frontend
   ```

2. **Push to Docker Hub**
   ```bash
   docker login
   docker push your-username/bytelink-backend:1.0.0
   docker push your-username/bytelink-frontend:1.0.0
   ```

3. **Deploy on server**
   ```bash
   docker pull your-username/bytelink-backend:1.0.0
   docker run -d \
     --name bytelink-backend \
     -p 4000:4000 \
     --env-file .env \
     your-username/bytelink-backend:1.0.0
   ```

---

### Option 2: Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   curl https://cli.heroku.com/install.sh | sh
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   heroku create bytelink-api
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
   heroku config:set JWT_SECRET=$(openssl rand -hex 32)
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://yourdomain.com
   ```

4. **Configure Procfile** (if using buildpack)
   ```
   web: cd backend && npm start
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **View logs**
   ```bash
   heroku logs --tail
   ```

---

### Option 3: Railway/Render/Fly.io

#### Railway

1. **Connect GitHub repository**
   - Go to railway.app, create new project
   - Select "Deploy from GitHub"
   - Choose bytelink repository

2. **Set environment variables in dashboard**
   - MONGO_URI
   - JWT_SECRET
   - NODE_ENV=production
   - CORS_ORIGIN

3. **Configure build and start commands**
   - Build: `npm install && cd backend && npm install`
   - Start: `cd backend && npm start`

4. **Deploy automatically on push**

#### Render/Fly.io (Similar process)
- Create account, connect GitHub
- Set environment variables
- Deploy

---

### Option 4: Traditional VPS/Cloud Server

#### AWS EC2 / DigitalOcean / Linode

1. **SSH into server**
   ```bash
   ssh ubuntu@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   curl https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git
   sudo npm install -g pm2
   ```

3. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/bytelink.git
   cd bytelink
   ```

4. **Install and configure**
   ```bash
   npm install
   cd backend && npm install
   cp .env.example .env
   # Edit .env with production values
   ```

5. **Start with PM2 (process manager)**
   ```bash
   pm2 start src/index.js --name "bytelink" --node-args="--env-file=.env"
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location /api {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Verification

### Health Checks
```bash
# Check backend health
curl -X GET http://localhost:4000/api/health

# Check authentication
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123"}'

# Create short URL
curl -X POST http://localhost:4000/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"longUrl":"https://example.com"}'

# Test redirect
curl -L http://localhost:4000/api/redirect/abc123
```

### Performance Testing
```bash
# Use Apache Bench
ab -n 100 -c 10 http://localhost:4000/api/health

# Or use wrk
wrk -t4 -c100 -d30s http://localhost:4000/api/health
```

### Database Verification
```bash
# Connect to MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/bytelink"

# Check collections
show collections

# Verify indexes
db.urls.getIndexes()
db.users.getIndexes()
db.visits.getIndexes()

# Sample data
db.urls.findOne()
```

### Security Verification
```bash
# Check security headers
curl -i http://localhost:4000/api/health
# Should include:
# - Strict-Transport-Security
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Content-Security-Policy

# Check CORS
curl -i -X OPTIONS http://localhost:4000/api/urls \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB connection string
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Verify credentials are URL-encoded (use special char if needed)
# Test connection: mongosh "your-connection-string"

# Check MongoDB Atlas whitelist (IP address, /0 for all)
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

### Memory Issues
```bash
# Increase Node.js heap
node --max-old-space-size=4096 src/index.js

# Or set in environment
export NODE_OPTIONS=--max-old-space-size=4096
```

### Slow Queries
```bash
# Enable Mongoose logging (development only)
mongoose.set('debug', true);

# Check indexes
db.urls.getIndexes()

# Add missing indexes
db.urls.createIndex({shortCode: 1})
db.urls.createIndex({user: 1})
db.visits.createIndex({shortCode: 1, createdAt: -1})
```

---

## Production Best Practices

1. **Always use HTTPS** - Get SSL certificate from Let's Encrypt
2. **Enable HTTP/2** - Improves performance for multiple requests
3. **Set security headers** - Already configured with Helmet
4. **Use environment variables** - Never hardcode secrets
5. **Monitor logs** - Set up log aggregation (ELK Stack, Loggly, etc.)
6. **Database backups** - Schedule automatic backups
7. **CDN for static files** - Serve frontend/assets from CDN
8. **Load balancing** - Use if expecting high traffic
9. **Auto-scaling** - Configure based on metrics
10. **Regular updates** - Keep dependencies updated with security patches

---

## Monitoring & Maintenance

### Recommended Tools
- **Error tracking**: Sentry, Rollbar
- **Performance monitoring**: New Relic, DataDog, Prometheus
- **Uptime monitoring**: Uptimerobot, Pingdom
- **Log aggregation**: ELK Stack, Splunk, Loggly
- **CDN**: Cloudflare, AWS CloudFront
- **Database backups**: MongoDB Atlas automated backups

### Health Monitoring Script
```bash
#!/bin/bash
# check_health.sh

ENDPOINT="http://localhost:4000/api/health"

while true; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)
  
  if [ $RESPONSE -eq 200 ]; then
    echo "[$(date)] ✓ Service healthy"
  else
    echo "[$(date)] ✗ Service unhealthy (HTTP $RESPONSE)"
    # Send alert, restart service, etc.
  fi
  
  sleep 300  # Check every 5 minutes
done
```

---

## Rollback Procedure

If deployment fails:

1. **Docker**: `docker-compose down && docker-compose up -d` with previous image
2. **Heroku**: `heroku releases` to see history, `heroku rollback` to revert
3. **Git**: `git reset --hard <previous-commit>` and redeploy
4. **Database**: Keep separate backup, restore if needed

---

## Scaling Considerations

As traffic grows:

1. **Horizontal scaling**: Run multiple instances behind load balancer
2. **Database scaling**: MongoDB Atlas sharding, read replicas
3. **Caching layer**: Redis for analytics, session storage
4. **Queue system**: Bull/BullMQ for background jobs (CSV processing)
5. **CDN**: Serve static files globally
6. **Microservices**: Split into separate services if needed

---

Generated: 2024
For questions or issues, refer to the main README.md file.
