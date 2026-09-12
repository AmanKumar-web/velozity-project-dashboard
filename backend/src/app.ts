import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

export const createApp = (): Express => {
  const app = express();

  // Security and utilities middleware
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Main API Router
  app.use('/api', apiRouter);

  // 404 Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Resource not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
