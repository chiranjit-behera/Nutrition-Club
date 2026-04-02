const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const job = require("./middleware/cron");

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") job.start();

// Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:5173', 'https://bookingatcutmpkd.vercel.app'],
//   credentials: true
// }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    // Allow any vercel.app subdomain
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// // Routes
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Food Order API is running' });
// });

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/event-plans', require('./routes/eventPlanRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Food Order API is running' }));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
