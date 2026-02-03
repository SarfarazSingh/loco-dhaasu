# LOCO DHAASU - Quick Start Guide

## What's Been Setup

✅ **Frontend**
- Order form modal on landing page
- Form validation & styling
- Order summary calculation
- API integration ready

✅ **Backend**
- Express.js server with order API
- Firebase Firestore integration
- Twilio SMS notifications
- SendGrid email notifications
- Admin dashboard

✅ **Services**
- Order creation & tracking
- Real-time notifications (3 channels)
- Dashboard with filters & stats

## Step 1: Configure Backend Services

### 1.1 Firebase Setup (Free Tier)
1. Go to https://console.firebase.google.com
2. Create new project "loco-dhaasu"
3. Enable Firestore Database (Start in test mode)
4. Project Settings → Service Accounts → Generate Key
5. Copy JSON to `.env` file as `FIREBASE_SERVICE_ACCOUNT`

### 1.2 Twilio Setup (SMS - $20 starter credit)
1. Sign up at https://www.twilio.com
2. Verify phone number (your personal phone)
3. Get Account SID & Auth Token from dashboard
4. Buy a phone number
5. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your-sid
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### 1.3 SendGrid Setup (Email - 100/day free)
1. Sign up at https://sendgrid.com
2. Create API key (Settings → API Keys)
3. Verify sender email
4. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.xxx
   EMAIL_FROM=noreply@locodhaasu.com
   ```

## Step 2: Start Backend

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3001`

You should see:
```
🌯 LOCO DHAASU Backend running on http://localhost:3001
Firebase: Connected ✓
Twilio: Configured ✓
SendGrid: Configured ✓
```

## Step 3: Test Order Form

1. Open landing page in browser
2. Click "ORDER DELIVERY" button
3. Fill the form:
   - Name: "Test User"
   - Phone: "+34 600 123 456"
   - Address: "Test Street 123"
   - Zone: Select any
   - Select rolls (min 1)
   - Choose delivery time
4. Click "CONFIRM ORDER"

You should receive:
- ✓ SMS on your phone
- ✓ Email notification
- ✓ Order appears in dashboard

## Step 4: Open Admin Dashboard

Open `backend/dashboard.html` in browser

Features:
- Real-time order list
- Filter by status & zone
- Update order status (Prep → OFD → Delivered)
- Daily stats (revenue, pending orders, etc)
- Auto-refreshes every 30 seconds

## Step 5: Deploy to Production

### Option A: Vercel (Easiest)
```bash
npm i -g vercel
cd backend
vercel --prod
```

### Option B: Railway (Easiest - Just push)
1. Push code to GitHub
2. Go to railway.app
3. Connect GitHub repo
4. Add env variables
5. Deploy (auto)

### Option C: Heroku
```bash
heroku create your-app-name
heroku config:set FIREBASE_SERVICE_ACCOUNT='...'
git push heroku main
```

## Key Files

```
frontend/
├── index.html          (Order form modal added)
├── script.js           (Form handling + Firebase)
└── styles.css          (Modal styles)

backend/
├── server.js           (Express API)
├── package.json        (Dependencies)
├── .env.example        (Template)
├── .env                (Your secrets - don't commit!)
├── dashboard.html      (Admin panel)
└── README.md           (Full docs)
```

## API Endpoints Summary

```
POST   /api/orders              Create order
GET    /api/orders              List orders (with filters)
GET    /api/orders/:orderId     Get single order
PATCH  /api/orders/:orderId     Update status
GET    /api/dashboard/stats     Get stats
```

## Environment Variables

```env
# Required for all features
FIREBASE_SERVICE_ACCOUNT='...'
FIREBASE_DATABASE_URL='https://...'

# For SMS
TWILIO_ACCOUNT_SID='...'
TWILIO_AUTH_TOKEN='...'
TWILIO_PHONE_NUMBER='+1234567890'

# For Email
SENDGRID_API_KEY='SG...'
EMAIL_FROM='noreply@locodhaasu.com'

# Admin
ADMIN_EMAIL='admin@locodhaasu.com'
ADMIN_PHONE='+34600000000'

# Server
PORT=3001
FRONTEND_URL='http://localhost:5500'
```

## Notification Flow

When order is placed:

```
Customer fills form
    ↓
POST /api/orders
    ↓
    ├→ Save to Firestore ✓
    ├→ Send SMS to customer ✓
    ├→ Send SMS to admin ✓
    ├→ Send email to admin ✓
    ├→ Send email to customer ✓
    └→ Send push notification ✓
```

## Testing Without Real Services

To test without all services:
- Skip `.env` variables (they're optional)
- Backend logs orders even without Firebase
- SMS/Email/Push gracefully skip if not configured
- Perfect for testing locally!

## Troubleshooting

**"Cannot POST /api/orders"**
- Backend not running? Run `npm start` in backend folder
- Wrong URL? Should be `http://localhost:3001`

**"SMS not sending"**
- Check phone format: should start with +
- Check Twilio balance
- Verify phone number is verified in Twilio

**"Email not sending"**
- Verify sender email in SendGrid
- Check API key is correct
- Check spam folder

**"Firebase connection error"**
- Check JSON is properly formatted
- Verify firestore is enabled in console
- Check internet connection

## Next Features to Add

- Customer order tracking page
- Automated delivery time slots
- Payment integration (Stripe)
- Real-time location tracking
- Admin authentication
- Order history & analytics
- Loyalty rewards system

## Support Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com)
- [Express Docs](https://expressjs.com)

Good luck! 🚀
