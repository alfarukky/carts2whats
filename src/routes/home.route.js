import { Router } from 'express';
import { renderLanding } from '../controllers/home.controllers.js';

const homeRoute = Router();

homeRoute.get('/', renderLanding);

export default homeRoute;
