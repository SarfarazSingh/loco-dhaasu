import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Firebase Admin Initialization
// Replace with your Firebase service account JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (Object.keys(serviceAccount).length > 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore?.() || null;

// Twilio Configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Nodemailer Configuration for SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// Helper: Format phone to E.164
function formatPhoneE164(phone, countryCode = '+34') {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already in E.164 format, return as-is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    return countryCode + cleaned.substring(1);
  }
  
  // Otherwise, prepend country code
  if (!cleaned.startsWith(countryCode.replace('+', ''))) {
    return countryCode + cleaned;
  }
  
  return '+' + cleaned;
}

// Helper: Send SMS via Twilio
async function sendSMS(phoneNumber, message) {
  try {
    if (!TWILIO_PHONE) {
      console.log('SMS skipped - Twilio not configured');
      return;
    }

    const formattedPhone = formatPhoneE164(phoneNumber);
    
    await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: formattedPhone
    });
    
    console.log(`SMS sent to ${formattedPhone}`);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
}

// Helper: Send Email via SendGrid
async function sendEmail(to, subject, htmlContent) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email skipped - SendGrid not configured');
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@locodhaasu.com',
      to: to,
      subject: subject,
      html: htmlContent
    });
    
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error.message);
  }
}

// Helper: Send browser push notification
async function sendPushNotification(title, options = {}) {
  try {
    if (!process.env.FCM_SERVER_KEY) {
      console.log('Push notification skipped - FCM not configured');
      return;
    }

    // This would normally send to subscribed clients
    // For now, we'll log it
    console.log(`Push notification: ${title}`, options);
  } catch (error) {
    console.error('Push notification error:', error.message);
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// POST: Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;

    // Validation
    if (!orderData.customer?.name || !orderData.customer?.phone || !orderData.items?.length) {
      return res.status(400).json({ 
        error: 'Missing required fields: customer name, phone, or items' 
      });
    }

    // Add server-side timestamp and status
    const order = {
      ...orderData,
      orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'pending'
    };

    // Save to Firebase
    if (db) {
      await db.collection('orders').doc(order.orderId).set(order);
    } else {
      console.log('Firebase not configured, order logged only:', order);
    }

    // Format notifications
    const itemList = order.items
      .map(item => `${item.quantity}x ${item.rollType} (€${(item.price * item.quantity).toFixed(2)})`)
      .join(', ');

    const customerName = order.customer.name;
    const customerPhone = order.customer.phone;
    const totalAmount = `€${order.total.toFixed(2)}`;
    const deliveryZone = order.customer.zone;
    const deliveryTime = order.delivery.timeWindow;

    // Send SMS to admin
    const smsMessage = `🌯 NEW ORDER - ${order.orderId}\n\n${customerName}\n${itemList}\nTotal: ${totalAmount}\nZone: ${deliveryZone}\nDelivery: ${deliveryTime}`;
    await sendSMS(process.env.ADMIN_PHONE, smsMessage);

    // Send SMS to customer
    const customerSMS = `🌯 LOCO DHAASU - Order confirmed!\n\nOrder ID: ${order.orderId}\nTotal: ${totalAmount}\nDelivery: ${deliveryTime}\n\nTrack updates at: locodhaasu.com/orders`;
    await sendSMS(customerPhone, customerSMS);

    // Send email to admin
    const adminEmailHtml = `
      <h2>New Order: ${order.orderId}</h2>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      <p><strong>Email:</strong> ${order.customer.email || 'Not provided'}</p>
      <p><strong>Address:</strong> ${order.customer.address}</p>
      <p><strong>Zone:</strong> ${deliveryZone}</p>
      <h3>Items:</h3>
      <ul>${order.items.map(item => `<li>${item.quantity}x ${item.rollType} - €${(item.price * item.quantity).toFixed(2)}</li>`).join('')}</ul>
      <p><strong>Total:</strong> ${totalAmount}</p>
      <p><strong>Delivery Time:</strong> ${deliveryTime}</p>
      ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ''}
      <p><small>Order placed: ${new Date(order.createdAt).toLocaleString()}</small></p>
    `;
    
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New Order - ${order.orderId}`,
      adminEmailHtml
    );

    // Send email to customer
    if (order.customer.email) {
      const customerEmailHtml = `
        <h2>Order Confirmed! 🌯</h2>
        <p>Hi ${customerName},</p>
        <p>Your order has been received and we're getting started!</p>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <ul>${order.items.map(item => `<li>${item.quantity}x ${item.rollType}</li>`).join('')}</ul>
        <p><strong>Total:</strong> ${totalAmount}</p>
        <p><strong>Estimated Delivery:</strong> ${deliveryTime}</p>
        <p>You'll receive updates via SMS. Thank you for your order!</p>
        <p><strong>LOCO DHAASU Team</strong></p>
      `;
      
      await sendEmail(
        order.customer.email,
        'Order Confirmed - LOCO DHAASU',
        customerEmailHtml
      );
    }

    // Send push notification
    await sendPushNotification('New Order Received', {
      body: `${customerName} ordered ${itemList}`,
      tag: order.orderId
    });

    res.status(201).json({
      success: true,
      orderId: order.orderId,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch all orders (with filtering)
app.get('/api/orders', async (req, res) => {
  try {
    const { status, zone, limit = 50, offset = 0 } = req.query;

    if (!db) {
      return res.json({ orders: [], total: 0, message: 'Firebase not configured' });
    }

    let query = db.collection('orders');

    // Apply filters
    if (status) {
      query = query.where('orderStatus', '==', status);
    }
    if (zone) {
      query = query.where('customer.zone', '==', zone);
    }

    // Sort by newest first
    query = query.orderBy('createdAt', 'desc');

    // Execute query
    const snapshot = await query.limit(parseInt(limit) + parseInt(offset)).get();
    const allOrders = snapshot.docs.map(doc => doc.data());
    const orders = allOrders.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      orders: orders,
      total: allOrders.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch single order
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!db) {
      return res.status(404).json({ error: 'Firebase not configured' });
    }

    const doc = await db.collection('orders').doc(orderId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(doc.data());

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH: Update order status
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ error: 'orderStatus is required' });
    }

    if (!db) {
      return res.status(404).json({ error: 'Firebase not configured' });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    // Update order
    await db.collection('orders').doc(orderId).update({
      orderStatus: orderStatus,
      updatedAt: new Date().toISOString()
    });

    // Get updated order for notifications
    const doc = await db.collection('orders').doc(orderId).get();
    const order = doc.data();

    // Send status update notifications
    const statusMessages = {
      confirmed: '✓ Your order has been confirmed!',
      preparing: '👨‍🍳 We\'re preparing your rolls!',
      out_for_delivery: '🛵 Your order is on the way!',
      delivered: '✓ Order delivered! Enjoy!'
    };

    if (statusMessages[orderStatus]) {
      const message = `${statusMessages[orderStatus]}\nOrder: ${orderId}`;
      await sendSMS(order.customer.phone, message);

      if (order.customer.email) {
        await sendEmail(
          order.customer.email,
          `Order Update - ${statusMessages[orderStatus]}`,
          `<p>${statusMessages[orderStatus]}</p><p>Order ID: ${orderId}</p>`
        );
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      orderStatus: orderStatus
    });

  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    if (!db) {
      return res.json({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0
      });
    }

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const snapshot = await db.collection('orders')
      .where('createdAt', '>=', today.toISOString())
      .where('createdAt', '<', tomorrow.toISOString())
      .get();

    const orders = snapshot.docs.map(doc => doc.data());
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.orderStatus)).length;
    const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;

    res.json({
      totalOrders: orders.length,
      pendingOrders: pendingOrders,
      completedOrders: completedOrders,
      totalRevenue: totalRevenue.toFixed(2)
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌯 LOCO DHAASU Backend running on http://localhost:${PORT}`);
  console.log(`Firebase: ${db ? 'Connected ✓' : 'Not configured'}`);
  console.log(`Twilio: ${TWILIO_PHONE ? 'Configured ✓' : 'Not configured'}`);
  console.log(`SendGrid: ${process.env.SENDGRID_API_KEY ? 'Configured ✓' : 'Not configured'}`);
});
