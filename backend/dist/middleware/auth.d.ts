import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export declare const authenticateToken: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorizeProjectOwnership: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
