import express from 'express';
import { authenticate } from '../../users/auth/middleware';

export const adminRouter = express.Router();

adminRouter.use(authenticate);
adminRouter.use('/');