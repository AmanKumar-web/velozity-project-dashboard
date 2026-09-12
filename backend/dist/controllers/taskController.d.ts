import { Request, Response, NextFunction } from 'express';
export declare const getTasks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
