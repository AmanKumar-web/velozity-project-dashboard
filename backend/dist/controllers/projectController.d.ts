import { Request, Response, NextFunction } from 'express';
export declare const getProjects: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProjectById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
