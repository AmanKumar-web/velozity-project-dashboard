import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    clientId: z.ZodString;
    pmId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    clientId: string;
    pmId?: string | undefined;
}, {
    title: string;
    description: string;
    clientId: string;
    pmId?: string | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    pmId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    pmId?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    clientId?: string | undefined;
    pmId?: string | undefined;
}>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    projectId: z.ZodString;
    developerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    priority: z.ZodDefault<z.ZodNativeEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
    dueDate: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    dueDate: string;
    developerId?: string | null | undefined;
}, {
    projectId: string;
    title: string;
    description: string;
    dueDate: string;
    developerId?: string | null | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
}>;
export declare const updateTaskStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
    }>;
}, "strip", z.ZodTypeAny, {
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
}, {
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
}>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    developerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
    }>>;
    priority: z.ZodOptional<z.ZodNativeEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
    dueDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    developerId?: string | null | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    dueDate?: string | undefined;
}, {
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    developerId?: string | null | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    dueDate?: string | undefined;
}>;
export declare const taskFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
    }>>;
    priority: z.ZodOptional<z.ZodNativeEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | undefined;
    search?: string | undefined;
    projectId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | undefined;
    search?: string | undefined;
    projectId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
