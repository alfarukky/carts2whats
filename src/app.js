import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import adminRoute from './routes/admin.route.js';

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
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'flashsecret',
    resave: false,
    saveUninitialized: true,
  })
);

// Flash middleware
app.use(flash());

// Global variables for all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});



app.use('/api/auth', adminRoute);

//catch all routes
// app.get('/*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

export default app;
