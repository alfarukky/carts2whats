import { Router } from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

import {
  listProducts,
  showAddProductForm,
  addProduct,
  showEditProductForm,
  updateProduct,
  deleteProduct,
  togglePopular,
  toggleStock,
} from "../controllers/product.controllers.js";

const productRoute = Router();

// PUBLIC: show all general products
productRoute.get("/", listProducts);

// ADMIN: add new product
productRoute.get("/add", isLoggedIn, showAddProductForm);
productRoute.post("/add", isLoggedIn, uploadSingle("image"), addProduct);

// ADMIN: edit product
productRoute.get("/:id/edit", isLoggedIn, showEditProductForm);
productRoute.post("/:id/edit", isLoggedIn, uploadSingle("image"), updateProduct);

// ADMIN: delete product
productRoute.get("/:id/delete", isLoggedIn, deleteProduct);

// ADMIN: toggle popular
productRoute.get("/:id/toggle-popular", isLoggedIn, togglePopular);

// ADMIN: toggle stock status
productRoute.get("/:id/toggle-stock", isLoggedIn, toggleStock);

export default productRoute;
