import { Router } from 'express';
import {
  registerAdmin,
  showRegisterPage,
  showLoginPage,
  loginAdmin,
} from '../controllers/admin.controllers.js';

const adminRoute = Router();

// Show form
adminRoute.get('/register', showRegisterPage);

// Handle form submission
adminRoute.post('/register', registerAdmin);


// LOGIN
adminRoute.get('/login', showLoginPage);
adminRoute.post('/login', loginAdmin);

export default adminRoute;
