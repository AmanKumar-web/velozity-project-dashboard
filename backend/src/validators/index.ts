import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createProjectSchema = z.object({
  title: z.string().min(2, 'Project title must be at least 2 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  clientId: z.string().uuid('Valid client ID is required'),
  pmId: z.string().uuid().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(5).optional(),
  clientId: z.string().uuid().optional(),
  pmId: z.string().uuid().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  projectId: z.string().uuid('Valid project ID is required'),
  developerId: z.string().uuid().nullable().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid ISO due date is required',
  }),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().min(5).optional(),
  developerId: z.string().uuid().nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid ISO due date is required',
    })
    .optional(),
});

export const taskFilterSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  projectId: z.string().uuid().optional(),
});
