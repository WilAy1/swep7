import express from 'express';
import { excludeFromAdminAuth } from '../auth/middleware';
import { collectionRouter } from './collection.router';
import { adminLoginRouter } from './login/login.router';

export const adminRouter = express.Router();

adminRouter.use(excludeFromAdminAuth(['/account/login', '/account/verify', '/account/register']));
adminRouter.use('/account', adminLoginRouter);
adminRouter.use('/collection', collectionRouter);