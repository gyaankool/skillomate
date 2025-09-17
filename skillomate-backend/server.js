const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const Razorpay = require('razorpay');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const envConfig = require('./config/environment');
const { scheduleMonthlyReset, scheduleExpiredSubscriptionCheck } = require('./jobs/monthlyReset');

const app = express();


// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration - using environment config
const allowedOrigins = [
  ...envConfig.CORS_ORIGINS,
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Debug: Log all registered routes
if (process.env.NODE_ENV !== 'production') {
  console.log('Registered routes:');
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log(r.route.path);
    } else if (r.name === 'router') {
      r.handle.stack.forEach(function(subR){
        if (subR.route) {
          console.log('  ' + r.regexp.source.replace('\\/?', '') + subR.route.path);
        }
      });
    }
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'GetSkilled Homework Helper API is running',
    timestamp: new Date().toISOString()
  });
});

// Development route to reset rate limiting
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/reset-rate-limit', (req, res) => {
    // Reset rate limiting for development
    res.status(200).json({ 
      message: 'Rate limit reset for development',
      timestamp: new Date().toISOString()
    });
  });
}

app.post('/api/subscribe', async (req, res) => {
  try {
    const { amount, currency, receipt, plan } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate plan and amount
    const planPricing = {
      student: 100, // ₹1200 in paise
   
    };

    if (plan && planPricing[plan] && amount !== planPricing[plan]) {
      return res.status(400).json({ 
        message: `Invalid amount for ${plan} plan. Expected ${planPricing[plan]} paise` 
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount,
      currency,
      receipt,
      notes: {
        plan: plan || 'student',
        timestamp: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Failed to create order" });
    }

    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 SMTP configured for: ${process.env.SMTP_HOST}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  // Schedule monthly token reset and subscription checks
  scheduleMonthlyReset();
  scheduleExpiredSubscriptionCheck();
  console.log(`⏰ Scheduled jobs initialized`);
});
