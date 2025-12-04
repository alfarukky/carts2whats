import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import mysqlSession from "express-mysql-session";
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import homeRoute from './routes/home.route.js';
import adminRoute from './routes/admin.route.js';
import promoRoute from './routes/promo.route.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'flashsecret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {maxAge: 1000 * 60 * 60 * 24}, // 1 day
  })
);

// Flash middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.admin = req.session.admin || null;
  next();
});

// Global variables for all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash("error", "Internal Server Error");
  res.redirect("back");
});


app.use('/', homeRoute);

app.use('/api/auth', adminRoute);
app.use('/api/admin/promo', promoRoute);

//catch all routes
// app.get('/*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

export default app;
