# Bytelink - Production-Grade URL Shortener

A full-stack URL shortening service with advanced analytics, QR code generation, custom aliases, expiration management, and comprehensive visitor tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-v24.16.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)

## 🎯 Project Overview

Bytelink is a modern, feature-rich URL shortening platform designed for production use. It provides users with the ability to create shortened URLs, track visitor analytics with geographic information, generate QR codes, and manage bulk URL uploads. The application implements enterprise-grade security measures and is built with scalability in mind.

### Key Features

- **URL Shortening** - Convert long URLs into compact, shareable short links
- **Custom Aliases** - Create memorable custom short codes (4-30 characters)
- **QR Code Generation** - Automatically generate and download QR codes for each URL
- **URL Expiration** - Set expiration dates for time-sensitive links
- **Advanced Analytics** - Track clicks, visitor sources, browsers, devices, and geographic location
- **Bulk Upload** - Import multiple URLs via CSV with per-row error reporting
- **Public Statistics** - Share link statistics without authentication
- **Geo-Tracking** - Capture visitor country and city information
- **Device Detection** - Identify visitor browser, OS, and device type
- **Rate Limiting** - Protect API endpoints from abuse
- **Data Validation** - Comprehensive input validation and sanitization

---

## 📋 Architecture Overview

```mermaid
graph TB
    Client["React Frontend<br/>Port 5173"]
    
    subgraph Backend["Express.js Backend<br/>Port 4000"]
        API["API Gateway<br/>Express Server"]
        Auth["Auth Middleware<br/>JWT Verification"]
        Validation["Validation Middleware<br/>express-validator"]
        RateLimit["Rate Limiting<br/>express-rate-limit"]
        
        AuthCtrl["Auth Controller<br/>signup/login/profile"]
        URLCtrl["URL Controller<br/>create/update/delete"]
        AnalyticsCtrl["Analytics Controller<br/>dashboard/public stats"]
        RedirectCtrl["Redirect Controller<br/>short code routing"]
        
        AuthSvc["Auth Service<br/>bcrypt/JWT"]
        URLSvc["URL Service<br/>code gen/alias mgmt"]
        AnalyticsSvc["Analytics Service<br/>aggregation pipelines"]
        VisitSvc["Visit Service<br/>enrichment/tracking"]
        
        Models["Data Models<br/>User/URL/Visit"]
    end
    
    subgraph Database["MongoDB Atlas"]
        UserDB["Users Collection<br/>email/password/profile"]
        URLDB["URLs Collection<br/>shortCode/longUrl/expiry"]
        VisitDB["Visits Collection<br/>metadata/geo/device"]
    end
    
    Security["Security Layer<br/>Helmet/HPP/Sanitize"]
    
    Client -->|HTTP/JSON| API
    API --> Auth
    Auth --> Validation
    Validation --> RateLimit
    RateLimit --> AuthCtrl
    RateLimit --> URLCtrl
    RateLimit --> AnalyticsCtrl
    RateLimit --> RedirectCtrl
    
    AuthCtrl --> AuthSvc
    URLCtrl --> URLSvc
    AnalyticsCtrl --> AnalyticsSvc
    RedirectCtrl --> VisitSvc
    
    AuthSvc --> Models
    URLSvc --> Models
    AnalyticsSvc --> Models
    VisitSvc --> Models
    
    Models --> Database
    Security -.->|Applied To All| API
```

### Technology Stack

**Frontend:**
- React 18.3.1 - UI library
- Vite 5.4.1 - Build tool & dev server
- Tailwind CSS 3.4.5 - Styling
- React Router 6.16.0 - Client routing
- Chart.js 4.5.1 - Analytics visualization
- QRCode.js - QR code generation

**Backend:**
- Node.js v24.16.0 - Runtime
- Express 4.18.2 - Web framework
- MongoDB 7.5.2 (via Mongoose) - Database
- JWT - Authentication
- bcrypt - Password hashing
- Helmet - Security headers
- express-rate-limit - Rate limiting
- express-validator - Input validation
- express-mongo-sanitize - NoSQL injection prevention
- hpp - Parameter pollution protection
- ua-parser-js - User agent parsing
- geoip-lite - IP geolocation
- QRCode - QR generation

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v24.16.0 or higher
- npm v10.0.0 or higher
- MongoDB Atlas account (or local MongoDB)
- Git

### Environment Configuration

Create `.env` file in the `backend/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bytelink?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com

# Server Port
PORT=4000

# Node Environment
NODE_ENV=development
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/bytelink.git
cd bytelink
```

2. **Install root dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

**Development Mode (Both Frontend & Backend):**
```bash
# From root directory
npm run dev
```

**Backend Only:**
```bash
cd backend
npm start
# or with auto-reload
npm run dev
```

**Frontend Only:**
```bash
cd frontend
npm run dev
```

**Production Build:**
```bash
# Frontend
cd frontend
npm run build

# Serve with preview
npm run preview
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication Routes

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):** Same as signup

#### Get Profile
```http
GET /auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### URL Routes

#### Create Short URL
```http
POST /urls
Authorization: Bearer {token}
Content-Type: application/json

{
  "longUrl": "https://example.com/very/long/path",
  "alias": "myshortcode",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "id": "url_id",
  "shortCode": "myshortcode",
  "longUrl": "https://example.com/very/long/path",
  "shortUrl": "http://localhost:4000/myshortcode",
  "qrCode": "data:image/png;base64,...",
  "clicks": 0,
  "active": true,
  "expiresAt": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### List User URLs
```http
GET /urls
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` - Search in long URL
- `sort` - Field to sort by (createdAt, clicks, expiresAt)
- `order` - asc or desc

**Response (200):**
```json
{
  "urls": [
    {
      "id": "url_id",
      "shortCode": "myshortcode",
      "longUrl": "https://example.com/...",
      "clicks": 42,
      "active": true,
      "expiresAt": null,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### Bulk Create URLs
```http
POST /urls/bulk
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <CSV file>
```

**CSV Format:**
```csv
longUrl,alias,expiresAt
https://example1.com,alias1,2024-12-31T23:59:59Z
https://example2.com,alias2,
https://example3.com,,2024-12-31T23:59:59Z
```

**Response (201):**
```json
{
  "successful": 2,
  "failed": 1,
  "results": [
    {
      "row": 1,
      "status": "success",
      "shortCode": "alias1",
      "message": "URL created successfully"
    },
    {
      "row": 2,
      "status": "success",
      "shortCode": "abc123",
      "message": "URL created successfully"
    },
    {
      "row": 3,
      "status": "error",
      "message": "Invalid URL format"
    }
  ]
}
```

#### Delete URL
```http
DELETE /urls/{id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "URL deleted successfully"
}
```

---

### Analytics Routes

#### User Analytics Dashboard
```http
GET /urls/analytics
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "summary": {
    "totalUrls": 45,
    "activeUrls": 42,
    "totalClicks": 5240,
    "avgClicksPerDay": 125.7,
    "peakClicksPerDay": 450,
    "lastUpdated": "2024-01-15T15:30:00Z"
  },
  "dailyTrend": [
    {
      "date": "2024-01-15",
      "clicks": 150
    },
    {
      "date": "2024-01-16",
      "clicks": 210
    }
  ],
  "topUrls": [
    {
      "shortCode": "abc123",
      "longUrl": "https://example.com",
      "clicks": 850,
      "percentage": 16.2
    }
  ],
  "browsers": [
    { "name": "Chrome", "count": 2500, "percentage": 47.7 },
    { "name": "Firefox", "count": 1200, "percentage": 22.9 }
  ],
  "operatingSystems": [
    { "name": "Windows", "count": 3100, "percentage": 59.1 },
    { "name": "macOS", "count": 1500, "percentage": 28.6 }
  ],
  "devices": [
    { "name": "desktop", "count": 4000, "percentage": 76.3 },
    { "name": "mobile", "count": 1200, "percentage": 22.9 }
  ],
  "countries": [
    { "name": "United States", "code": "US", "count": 2500, "percentage": 47.7 },
    { "name": "India", "code": "IN", "count": 1200, "percentage": 22.9 }
  ],
  "cities": [
    { "name": "New York", "count": 850, "percentage": 16.2 },
    { "name": "San Francisco", "code": 650, "percentage": 12.4 }
  ],
  "recentVisits": [
    {
      "shortCode": "abc123",
      "ipAddress": "192.168.1.1",
      "browser": "Chrome",
      "operatingSystem": "Windows",
      "device": "desktop",
      "country": "United States",
      "city": "New York",
      "referrer": "google.com",
      "timestamp": "2024-01-15T15:30:00Z"
    }
  ]
}
```

#### Per-URL Analytics
```http
GET /urls/{id}/analytics
Authorization: Bearer {token}
```

**Response (200):** Similar structure to user dashboard, but specific to one URL

#### Public URL Statistics
```http
GET /public/stats/{shortCode}
```

**Response (200):**
```json
{
  "shortCode": "abc123",
  "longUrl": "https://example.com",
  "shortUrl": "http://localhost:4000/abc123",
  "clicks": 150,
  "active": true,
  "expiresAt": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastVisit": "2024-01-16T14:20:00Z",
  "recentVisits": [
    {
      "browser": "Chrome",
      "country": "United States",
      "city": "New York",
      "timestamp": "2024-01-16T14:20:00Z"
    }
  ]
}
```

---

### Redirect Route

#### Follow Short Link
```http
GET /{shortCode}
```

**Response (301/410):**
- 301 Redirect if URL is valid and active
- 410 Gone with HTML page if URL has expired
- 404 Not Found if short code doesn't exist

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### URLs Collection
```javascript
{
  _id: ObjectId,
  shortCode: String (unique, indexed, 4-30 chars),
  longUrl: String (required),
  user: ObjectId (ref: User, indexed),
  clicks: Number (default: 0),
  active: Boolean (default: true),
  expiresAt: Date (indexed, nullable),
  createdAt: Date (indexed),
  updatedAt: Date,
  
  // Compound Index
  // {user: 1, longUrl: 1} - Prevent duplicate URLs per user
}
```

### Visits Collection
```javascript
{
  _id: ObjectId,
  shortCode: String (ref: URL.shortCode, indexed),
  ipAddress: String,
  userAgent: String,
  referrer: String,
  browser: String,
  browserVersion: String,
  operatingSystem: String,
  device: String (desktop, mobile, tablet),
  country: String,
  city: String,
  timestamp: Date (indexed),
  createdAt: Date
}
```

**Indexes:**
- `shortCode` - Fast lookup for analytics
- `timestamp` - Time-range queries
- `country` - Geographic analysis
- `device` - Device type aggregation

---

## 🧮 Key Calculations & Validation Rules

### Short Code Generation
- **Length:** Random 8-character alphanumeric string `[A-Za-z0-9_-]`
- **Uniqueness:** Checked before insertion, retry on collision
- **Custom Alias Validation:** 4-30 characters, alphanumeric + underscore + hyphen

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### URL Validation
- Must start with `http://` or `https://`
- Valid domain format

### Expiration Logic
- **Check:** Performed on redirect
- **Return:** 410 Gone with styled HTML message if expired
- **Storage:** Kept in database (soft deletion pattern)

### Device Type Normalization
```
Unknown Device → desktop
Desktop → desktop
Notebook → desktop
Console → desktop
Mobile, Phone → mobile
Tablet → tablet
Smartwatch, Wearable → mobile
```

---

## 📊 Analytics Aggregation

The analytics service uses MongoDB aggregation pipelines for efficiency:

1. **Daily Click Trend** - `$group` by date, `$sort` by date
2. **Top 5 URLs** - `$group` by shortCode, `$sort` by clicks, `$limit` 5
3. **Browser/OS/Device Breakdown** - `$group` by field, count occurrences
4. **Geographic Data** - `$group` by country/city, count
5. **Recent 10 Visits** - `$sort` by timestamp desc, `$limit` 10

All aggregations use `$match` to filter by user/shortCode before grouping.

---

## 🔒 Security Implementation

### Rate Limiting Tiers
- **Global:** 100 requests per 15 minutes per IP
- **Auth Endpoints:** 5 attempts per 15 minutes (skips successful requests)
- **Bulk Upload:** 10 uploads per hour per IP

### Headers (Helmet.js)
- `Content-Security-Policy` - Restrict script sources
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `Strict-Transport-Security` - 1-year HSTS with preload
- `Referrer-Policy: strict-origin-when-cross-origin`

### Middleware Stack
1. Helmet - Secure headers
2. HPP - Parameter pollution protection
3. CORS - Origin validation
4. JSON/URL parsers - Size limits (10KB)
5. Mongo-Sanitize - NoSQL injection prevention
6. Rate Limit - Per-endpoint throttling
7. Validation - Input schema enforcement

### Data Protection
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- Sensitive fields excluded from API responses
- No credentials in logs

---

## 📦 Deployment Guide

### Prerequisites
- Docker (optional)
- MongoDB Atlas cluster
- Node.js hosting (Heroku, Railway, Render, AWS, DigitalOcean)

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=<atlas_connection_string>
JWT_SECRET=<strong_random_secret>
CORS_ORIGIN=https://yourdomain.com
PORT=4000
```

### Heroku Deployment

1. **Install Heroku CLI**
```bash
brew install heroku/brew/heroku
heroku login
```

2. **Create Heroku app**
```bash
heroku create bytelink-app
```

3. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=<atlas_uri>
heroku config:set JWT_SECRET=<secret>
```

4. **Deploy**
```bash
git push heroku main
```

### Docker Deployment

**Dockerfile (Backend):**
```dockerfile
FROM node:24.16.0
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/src ./src
EXPOSE 4000
CMD ["node", "src/index.js"]
```

**Build and run:**
```bash
docker build -t bytelink-backend .
docker run -p 4000:4000 --env-file .env bytelink-backend
```

### Vercel Deployment (Frontend)

1. Push to GitHub
2. Connect repository to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy automatically

---

## 📸 Screenshots Section

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)
- URL management interface
- Create, edit, delete operations
- Search and filtering
- Bulk upload interface

### Analytics
![Analytics](./docs/screenshots/analytics.png)
- Daily click trend chart
- Top performing URLs
- Device/browser breakdown
- Geographic heat map
- Recent visitor list

### Public Stats
![Public Stats](./docs/screenshots/public-stats.png)
- Shareable statistics page
- Link expiration status
- Visit history

### QR Code
![QR Code](./docs/screenshots/qr-code.png)
- Auto-generated QR codes
- PNG download option
- Copy to clipboard

---

## 🎬 Demo Video Section

### Video Demonstrations

**Complete Walkthrough:** `[Link to YouTube/Vimeo video]`
- Creating shortened URLs
- Custom alias setup
- Bulk CSV upload
- Analytics dashboard
- QR code generation
- Public stats sharing

**Feature Highlights:** `[Link to demo video]`
- 2-minute feature overview
- Real-time click tracking
- Geographic analytics
- Device detection

---

## 🏆 Hackathon Statement

### Katomaran Hackathon Requirements

**Project Name:** Bytelink - Production-Grade URL Shortener

**Category:** Full-Stack Web Development

**Problem Statement:**
URL shortening is essential in today's digital landscape, yet existing solutions lack comprehensive analytics, security, and user-friendly bulk operations. Bytelink addresses this by providing a production-ready platform with enterprise-grade security, advanced visitor tracking, and developer-friendly APIs.

**Solution Description:**
Bytelink is a full-stack URL shortening service combining:
- **Frontend:** React + Vite with real-time analytics visualization
- **Backend:** Express.js with MongoDB for scalable data storage
- **Security:** Helmet, rate limiting, input validation, and NoSQL injection prevention
- **Analytics:** Geo-tracking, device detection, and browser identification
- **Features:** Custom aliases, QR codes, URL expiration, bulk upload

**Technology Innovation:**
1. **Dual-layer rate limiting** - Protects both global API and sensitive endpoints
2. **Aggregation pipelines** - Efficient MongoDB queries for real-time analytics
3. **Visitor enrichment** - Automatic browser, OS, device, and geo detection
4. **Flexible CSV import** - Auto-detects headers, handles errors per-row

**Impact:**
- Enables businesses to shorten, track, and analyze URLs at scale
- Provides actionable insights through geographic and device analytics
- Reduces spam through rate limiting and validation
- Supports enterprise workflows with bulk operations

**Team Contributions:**
- Full-stack development
- Security hardening
- API design and documentation
- Database optimization
- Frontend UI/UX

**Code Quality:**
- ✅ Modular architecture (services, controllers, middleware)
- ✅ Comprehensive error handling
- ✅ Input validation on all endpoints
- ✅ RESTful API design
- ✅ MongoDB best practices
- ✅ Production-ready security

**Deployment Ready:**
- Docker support
- Environment configuration
- Database migrations
- Error tracking
- Performance monitoring

**Unique Features:**
1. **Public stats pages** - Share analytics without auth
2. **Custom aliases** - Memorable short codes
3. **URL expiration** - Time-limited links with 410 response
4. **Bulk operations** - CSV upload with per-row error reporting
5. **Rich metadata** - Country/city, device type, browser version
6. **QR generation** - Instant downloadable QR codes

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@bytelink.dev
- Documentation: [docs/](./docs/)

---

## 🙏 Acknowledgments

- MongoDB for reliable data storage
- Express.js community for excellent middleware ecosystem
- React team for powerful frontend library
- All contributors and testers

---

**Last Updated:** June 2, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
