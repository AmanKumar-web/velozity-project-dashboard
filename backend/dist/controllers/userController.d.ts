import { Request, Response, NextFunction } from 'express';
export declare const getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getClients: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
