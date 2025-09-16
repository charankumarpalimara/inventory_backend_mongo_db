const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP detection (needed for Render)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware with relaxed image policy for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://shimmering-cannoli-4997e6.netlify.app", "http://localhost:8080"],
      "connect-src": ["'self'", "https://shimmering-cannoli-4997e6.netlify.app", "http://localhost:8080"]
    }
  }
}));

// Rate limiting - only in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Trust proxy for accurate IP detection
    trustProxy: true,
    // Skip successful requests
    skipSuccessfulRequests: false,
    // Skip failed requests
    skipFailedRequests: false,
    // Custom key generator to handle proxy issues
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if available, otherwise use connection remote address
      return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip;
    }
  });
  app.use(limiter);
  console.log('Rate limiting enabled for production');
} else {
  console.log('Rate limiting disabled for development');
}

// CORS configuration - Allow all origins for now
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Forwarded-For']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry_inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jewelry', require('./routes/jewelry'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Jewelry Inventory API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Trust proxy: ${app.get('trust proxy')}`);
});
