# LOCO DHAASU - Backend Setup & Deployment Guide

## Overview

The backend handles:
- Order management (create, read, update)
- Real-time notifications (SMS, Email, Browser Push)
- Admin dashboard with order tracking
- Order status updates

## Architecture

```
Backend (Express.js + Node.js)
    ↓
Firebase Firestore (Database)
    ↓
    ├→ Twilio (SMS notifications)
    ├→ SendGrid (Email notifications)
    └→ FCM (Browser push notifications)
```

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the `backend` folder based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials.

### 3. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3001`

## Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable Firestore Database
4. Create Service Account:
   - Project Settings → Service Accounts
   - Generate new private key → Download JSON
   - Copy the entire JSON content to `.env` as `FIREBASE_SERVICE_ACCOUNT`

### Twilio (SMS)

1. Sign up at [Twilio](https://www.twilio.com)
2. Get your Account SID and Auth Token from dashboard
3. Get a phone number for SMS
4. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### SendGrid (Email)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key (Settings → API Keys)
3. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxx
   EMAIL_FROM=noreply@locodhaasu.com
   ```

### Admin Contact

Update in `.env`:
```
ADMIN_EMAIL=your-email@example.com
ADMIN_PHONE=+34600000000  # E.164 format with country code
```

## API Endpoints

### Create Order
```
POST /api/orders
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "phone": "+34 600 123 456",
    "email": "john@example.com",
    "address": "Street 123, Apt 4B",
    "zone": "IE_University"
  },
  "items": [
    {"rollType": "CHICKEN", "quantity": 2, "price": 7.50},
    {"rollType": "VEG", "quantity": 1, "price": 6.50}
  ],
  "delivery": {
    "timeWindow": "12:00-12:30"
  },
  "specialInstructions": "Extra onions, no chili",
  "subtotal": 21.50,
  "deliveryFee": 2.00,
  "total": 23.50
}
```

### Get All Orders
```
GET /api/orders?status=pending&zone=IE_University&limit=20&offset=0
```

Query Parameters:
- `status` - Filter by order status
- `zone` - Filter by delivery zone
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

### Get Single Order
```
GET /api/orders/{orderId}
```

### Update Order Status
```
PATCH /api/orders/{orderId}
Content-Type: application/json

{
  "orderStatus": "preparing"
}
```

Valid statuses:
- `pending` - Initial state
- `confirmed` - Order confirmed by admin
- `preparing` - Being prepared
- `out_for_delivery` - On the way
- `delivered` - Completed
- `cancelled` - Cancelled

### Dashboard Stats
```
GET /api/dashboard/stats
```

## Database Schema (Firestore)

### Orders Collection

```
orders/
  ORDER_1234567890_abc123/
    {
      orderId: "ORDER_1234567890_abc123",
      customer: {
        name: "John Doe",
        phone: "+34600123456",
        email: "john@example.com",
        address: "Street 123",
        zone: "IE_University"
      },
      items: [
        {
          rollType: "CHICKEN",
          quantity: 2,
          price: 7.50
        }
      ],
      delivery: {
        timeWindow: "12:00-12:30",
        timestamp: "2026-02-03T12:00:00Z"
      },
      orderStatus: "pending",
      createdAt: "2026-02-03T11:30:00Z",
      updatedAt: "2026-02-03T11:30:00Z",
      subtotal: 15.00,
      deliveryFee: 2.00,
      total: 17.00,
      paymentStatus: "pending"
    }
```

## Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy

```bash
npm i -g vercel
vercel --prod
```

### Option 2: Railway

1. Go to [Railway](https://railway.app)
2. New Project → GitHub repo
3. Add environment variables
4. Deploy (auto-deploys on push)

### Option 3: Heroku

```bash
npm i -g heroku
heroku create your-app-name
heroku config:set FIREBASE_SERVICE_ACCOUNT='...'
git push heroku main
```

## Testing

### Test Order Creation

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Test User",
      "phone": "+34600123456",
      "email": "test@example.com",
      "address": "Test Street 123",
      "zone": "IE_University"
    },
    "items": [
      {"rollType": "CHICKEN", "quantity": 1, "price": 7.50}
    ],
    "delivery": {
      "timeWindow": "12:00-12:30"
    },
    "subtotal": 7.50,
    "deliveryFee": 2.00,
    "total": 9.50
  }'
```

### Test Health Check

```bash
curl http://localhost:3001/health
```

## Frontend Integration

Update frontend API calls:

```javascript
// In script.js or your form handler
const API_BASE = 'http://localhost:3001'; // Dev
// const API_BASE = 'https://your-deployed-url.com'; // Production

const response = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
});
```

## Admin Dashboard

Open `backend/dashboard.html` in a browser (requires backend running):
- View real-time orders
- Filter by status and zone
- Update order status
- See daily stats

## Troubleshooting

### "Firebase not configured"
- Check `.env` file has valid `FIREBASE_SERVICE_ACCOUNT`
- Verify JSON format is valid

### SMS not sending
- Verify `TWILIO_PHONE_NUMBER` format: +countrycode...
- Check customer phone format in request

### Email not sending
- Verify `SENDGRID_API_KEY` is correct
- Check `EMAIL_FROM` is verified in SendGrid

### CORS errors
- Add frontend URL to `CORS_ORIGINS` in `.env`
- Or update `cors` options in `server.js`

## Monitoring

Check server logs for:
- Order creation events
- Notification delivery status
- Firebase connection issues
- SMS/Email send failures

```bash
npm start  # Outputs all logs
```

## Security Notes

- Never commit `.env` file
- Rotate API keys regularly
- Use environment variables for all secrets
- Validate all user input on backend
- Add rate limiting for production
- Enable Firebase security rules

## Next Steps

1. Deploy backend to production (Vercel/Railway)
2. Update frontend API URL for production
3. Setup monitoring/logging (Sentry, LogRocket)
4. Add authentication for admin dashboard
5. Configure FCM for browser push notifications
6. Setup automated backups for Firestore

## Support

For issues:
1. Check `.env` configuration
2. Verify API endpoints in network tab
3. Check Firebase quota usage
4. Review Twilio/SendGrid logs
