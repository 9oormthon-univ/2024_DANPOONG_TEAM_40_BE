import express from 'express';
import healthController from '../controller/health-controller.js';

export const healthRoute = express.Router();

healthRoute.get('', healthController);