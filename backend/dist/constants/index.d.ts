export declare const ROLES: {
    readonly ADMIN: "ADMIN";
    readonly PROJECT_MANAGER: "PROJECT_MANAGER";
    readonly DEVELOPER: "DEVELOPER";
};
export declare const TASK_STATUS: {
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly IN_REVIEW: "IN_REVIEW";
    readonly DONE: "DONE";
};
export declare const TASK_PRIORITY: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
};
export declare const SOCKET_ROOMS: {
    readonly ADMIN_GLOBAL: "admin_global";
    readonly project: (projectId: string) => string;
    readonly user: (userId: string) => string;
};
export declare const SOCKET_EVENTS: {
    readonly JOIN_PROJECT: "join_project";
    readonly LEAVE_PROJECT: "leave_project";
    readonly ONLINE_COUNT: "online_count";
    readonly TASK_UPDATED: "task_updated";
    readonly TASK_CREATED: "task_created";
    readonly ACTIVITY_NEW: "activity_new";
    readonly NOTIFICATION_NEW: "notification_new";
};
