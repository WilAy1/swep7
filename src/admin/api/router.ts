import express from 'express';
import { authenticate } from '../../voters/auth/middleware';

export const adminRouter = express.Router();

adminRouter.use(authenticate);
adminRouter.use('/api/polls', );