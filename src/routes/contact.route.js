import { Router } from "express";
import { showContactPage, handleContactForm } from "../controllers/contact.controllers.js";

const contactRoute = Router();

contactRoute.get("/", showContactPage);
contactRoute.post("/", handleContactForm);

export default contactRoute;
