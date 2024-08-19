import express from 'express';
import { authenticateAdmin } from '..//auth/middleware';
import { collectionRouter } from './main';

export const adminRouter = express.Router();

adminRouter.use(authenticateAdmin);
adminRouter.use('/collection', collectionRouter);