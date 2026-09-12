import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;
    constructor(message: string, statusCode?: number, code?: string, details?: unknown);
}
export declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
