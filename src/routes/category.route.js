import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import {
  showCategoryManagement,
  createCategory,
  deleteCategory,
  togglePopular,
  updateCategoryImage,
  categoryImageUpload,
} from '../controllers/category.controllers.js';

const categoryRoute = Router();

// All category routes require admin authentication
categoryRoute.use(isLoggedIn);

// Show category management page
categoryRoute.get('/', showCategoryManagement);

// Create new category
categoryRoute.post('/', categoryImageUpload.single('image'), createCategory);

// Update category image only
categoryRoute.post('/:id/update-image', categoryImageUpload.single('image'), updateCategoryImage);

// Toggle popular status
categoryRoute.post('/:id/toggle-popular', togglePopular);

// Delete category
categoryRoute.post('/:id/delete', deleteCategory);

export default categoryRoute;
