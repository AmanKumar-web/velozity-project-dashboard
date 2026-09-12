export declare const emitTaskUpdate: (projectId: string, task: any) => void;
export declare const emitActivity: (projectId: string, activity: any, developerId?: string | null) => void;
export declare const createAndEmitNotification: (userId: string, message: string) => Promise<any>;
