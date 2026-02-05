import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import {
  showCategoryManagement,
  createCategory,
  deleteCategory,
} from '../controllers/category.controllers.js';

const categoryRoute = Router();

// All category routes require admin authentication
categoryRoute.use(isLoggedIn);

// Show category management page
categoryRoute.get('/', showCategoryManagement);

// Create new category
categoryRoute.post('/', createCategory);

// Delete category
categoryRoute.post('/:id/delete', deleteCategory);

export default categoryRoute;
