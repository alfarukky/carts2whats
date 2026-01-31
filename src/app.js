import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import mysqlSession from 'express-mysql-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadSiteContent } from './config/content.js';

import homeRoute from './routes/home.route.js';
import adminRoute from './routes/admin.route.js';
import promoRoute from './routes/promo.route.js';
import productRoute from './routes/product.route.js';
import checkoutRoute from './routes/checkout.route.js';
import postRoute from './routes/post.route.js';
import contactRoute from './routes/contact.route.js';
import orderVerificationRoute from './routes/orderVerification.route.js';
import couponRoute from './routes/coupon.route.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load site content
const siteContent = loadSiteContent();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// 🔥 SESSION + FLASH
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'flashsecret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  }),
);

// Flash middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.admin = req.session.admin || null;
  next();
});

// Global variables for all views
app.use((req, res, next) => {
  res.locals.content = siteContent;
  next();
});

app.use('/', homeRoute);
app.use('/api/checkout', checkoutRoute);

app.use('/api/auth', adminRoute);
app.use('/api/admin/promo', promoRoute);
app.use('/api/products', productRoute);
app.use('/api/posts', postRoute);
app.use('/contact', contactRoute);
app.use('/api/admin/orders', orderVerificationRoute);
app.use('/api/admin/coupons', couponRoute);

// 404 handler - catch all undefined routes
app.use((req, res, next) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    message: 'Page not found',
    url: req.originalUrl 
  });
});

// Error handler - moved to end after all routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't redirect on AJAX requests
  if (req.xhr) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  
  // For regular requests, render error page instead of redirecting
  res.status(500).render('error', { 
    title: 'Server Error',
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
