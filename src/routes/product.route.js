import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { generateCSRF, validateCSRF } from '../middleware/csrf.middleware.js';

import {
  listProducts,
  showAddProductForm,
  addProduct,
  showEditProductForm,
  updateProduct,
  deleteProduct,
  togglePopular,
  toggleStock,
} from '../controllers/product.controllers.js';

const productRoute = Router();

// PUBLIC: show all general products
productRoute.get('/', generateCSRF, listProducts);

// ADMIN: add new product
productRoute.get('/add', isLoggedIn, generateCSRF, showAddProductForm);
productRoute.post(
  '/add',
  isLoggedIn,
  uploadSingle('image'),
  validateCSRF,
  addProduct,
);

// ADMIN: edit product
productRoute.get('/:id/edit', isLoggedIn, generateCSRF, showEditProductForm);
productRoute.post(
  '/:id/edit',
  isLoggedIn,
  uploadSingle('image'),
  validateCSRF,
  updateProduct,
);

// ADMIN: delete product (FIXED: POST instead of GET)
productRoute.post('/:id/delete', isLoggedIn, validateCSRF, deleteProduct);

// ADMIN: toggle popular (FIXED: POST instead of GET)
productRoute.post(
  '/:id/toggle-popular',
  isLoggedIn,
  validateCSRF,
  togglePopular,
);

// ADMIN: toggle stock status (FIXED: POST instead of GET)
productRoute.post('/:id/toggle-stock', isLoggedIn, validateCSRF, toggleStock);

export default productRoute;
