import express from 'express';
import { excludeFromAuth } from './auth/middleware';
import { loginRouter } from './login/login.router';
import { collection } from './main/collection';

export const votersRouter = express.Router();


votersRouter.use(excludeFromAuth(['/voters/login', '/voters/verify-code', '/voters/collection-exists']));
votersRouter.use('/voters', loginRouter, collection);