import { z } from 'zod';
import { isCalendarDate } from './dates.js';

export const uuid = z.uuid();
export const status = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']);
export const priority = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const password = z.string().min(12).max(128);
export const memberPasswordReset = z.strictObject({ password });
export const registration = z.strictObject({
  name: z.string().trim().min(1).max(120),
  email,
  password,
});
export const login = z.strictObject({
  email,
  password: z.string().min(1).max(128),
});
export const projectInput = z.strictObject({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
});
const taskFields = z.strictObject({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(8000),
  projectId: uuid,
  assigneeId: uuid,
  status,
  priority,
  dueDate: z
    .string()
    .refine(
      isCalendarDate,
      'Use a real calendar date in YYYY-MM-DD format (1900 or later).',
    ),
});
export const taskInput = taskFields.extend({
  description: z.string().trim().max(8000).default(''),
  status: status.default('TODO'),
  priority: priority.default('MEDIUM'),
});
export const taskPatch = taskFields
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'Provide at least one editable field.',
  );
export const taskStatusInput = z.strictObject({ status });
export const taskQuery = z.strictObject({
  projectId: uuid.optional(),
  assigneeId: uuid.optional(),
  status: status.optional(),
  priority: priority.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
