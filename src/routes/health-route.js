import express from "express";
import { healthController } from "../controller/health-controller";

export const healthRoute = express.Router();

healthRoute.get('', healthController)