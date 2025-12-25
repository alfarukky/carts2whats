import {Router} from 'express';
import { isLoggedIn } from "../middleware/auth.middleware.js";
import {
  showPromoEditForm,
  updatePromoCard
} from "../controllers/promo.controllers.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const promoRoute = Router();

promoRoute.get("/:id/edit", isLoggedIn, showPromoEditForm);

promoRoute.post("/:id/edit", isLoggedIn, uploadSingle("image"), updatePromoCard);

export default promoRoute;

