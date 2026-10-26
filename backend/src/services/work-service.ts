import type { z } from 'zod';
import type { Prisma } from '../generated/prisma/client.js';
import type { Database } from '../db.js';
import type { Identity } from '../security.js';
import type * as input from '../validation.js';
import { ApiError } from '../errors.js';
import { dateValue, todayValue } from '../dates.js';
type TaskCreate = z.output<typeof input.taskInput>;
type TaskPatch = z.output<typeof input.taskPatch>;
type TaskQuery = z.output<typeof input.taskQuery>;
type ProjectInput = z.output<typeof input.projectInput>;
type ProjectPatch = { [K in keyof ProjectInput]?: ProjectInput[K] | undefined };
type Status = z.output<typeof input.status>;

const taskInclude = {
  assignee: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
} as const;
const taskJson = <T extends { dueDate: Date }>(task: T) => ({
  ...task,
  dueDate: task.dueDate.toISOString().slice(0, 10),
});
async function validateReferences(
  db: Database,
  data: { projectId?: string | undefined; assigneeId?: string | undefined },
) {
  if (
    data.projectId &&
    !(await db.project.findUnique({
      where: { id: data.projectId },
      select: { id: true },
    }))
  )
    throw new ApiError(400, 'INVALID_PROJECT', 'Select an existing project.');
  if (
    data.assigneeId &&
    !(await db.user.findUnique({
      where: { id: data.assigneeId },
      select: { id: true },
    }))
  )
    throw new ApiError(400, 'INVALID_ASSIGNEE', 'Select an existing assignee.');
}
export function createWorkService(db: Database) {
  return {
    async listAssignees() {
      return {
        users: await db.user.findMany({
          select: { id: true, name: true },
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
      };
    },
    async listProjects() {
      return {
        projects: await db.project.findMany({
          orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
          include: { _count: { select: { tasks: true } } },
        }),
      };
    },
    async getProject(id: string) {
      const project = await db.project.findUnique({
        where: { id: id },
      });
      if (!project) throw new ApiError(404, 'NOT_FOUND', 'Project not found.');
      return { project };
    },
    async createProject(data: ProjectInput, actorId: string) {
      return {
        project: await db.project.create({
          data: { ...data, createdById: actorId },
        }),
      };
    },
    async updateProject(id: string, data: ProjectPatch) {
      return {
        project: await db.project.update({
          where: { id: id },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.description !== undefined
              ? { description: data.description }
              : {}),
          },
        }),
      };
    },
    async deleteProject(id: string) {
      // The DB's ON DELETE RESTRICT handles concurrent task creation safely.
      await db.project.delete({ where: { id: id } });
    },
    async listTasks(query: TaskQuery) {
      const where: Prisma.TaskWhereInput = {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
        ...(query.search
          ? {
              OR: [
                {
                  title: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  description: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {}),
      };
      const [total, tasks] = await db.$transaction(
        [
          db.task.count({ where }),
          db.task.findMany({
            where,
            include: taskInclude,
            orderBy: [{ [query.sortBy]: query.sortOrder }, { id: 'asc' }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          }),
        ],
        { isolationLevel: 'RepeatableRead' },
      );
      return {
        tasks: tasks.map(taskJson),
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },
    async getTask(id: string) {
      const task = await db.task.findUnique({
        where: { id: id },
        include: taskInclude,
      });
      if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found.');
      return { task: taskJson(task) };
    },
    async createTask(data: TaskCreate, actorId: string) {
      await validateReferences(db, data);
      const task = await db.task.create({
        data: {
          ...data,
          dueDate: dateValue(data.dueDate),
          createdById: actorId,
        },
        include: taskInclude,
      });
      return { task: taskJson(task) };
    },
    async updateTask(id: string, data: TaskPatch | TaskCreate) {
      await validateReferences(db, data);
      const task = await db.task.update({
        where: { id: id },
        data: {
          ...data,
          ...(data.dueDate ? { dueDate: dateValue(data.dueDate) } : {}),
        } as Prisma.TaskUncheckedUpdateInput,
        include: taskInclude,
      });
      return { task: taskJson(task) };
    },
    async updateTaskStatus(
      id: string,
      status: Status,
      user: Pick<Identity, 'id' | 'role'>,
    ) {
      const result = await db.task.updateMany({
        where: {
          id,
          ...(user.role === 'ADMIN' ? {} : { assigneeId: user.id }),
        },
        data: { status },
      });
      if (!result.count) {
        if (
          !(await db.task.findUnique({ where: { id }, select: { id: true } }))
        )
          throw new ApiError(404, 'NOT_FOUND', 'Task not found.');
        throw new ApiError(
          403,
          'FORBIDDEN',
          'Only your assigned task status can be changed.',
        );
      }
      const task = await db.task.findUniqueOrThrow({
        where: { id },
        include: taskInclude,
      });
      return { task: taskJson(task) };
    },
    async deleteTask(id: string) {
      await db.task.delete({ where: { id: id } });
    },
    async dashboard() {
      const today = todayValue();
      const result = await db.$transaction(
        async (tx) => {
          const [
            totalProjects,
            totalTasks,
            completedTasks,
            overdueTasks,
            projects,
            completedByProject,
          ] = await Promise.all([
            tx.project.count(),
            tx.task.count(),
            tx.task.count({ where: { status: 'COMPLETED' } }),
            tx.task.count({
              where: { status: { not: 'COMPLETED' }, dueDate: { lt: today } },
            }),
            tx.project.findMany({
              select: {
                id: true,
                name: true,
                _count: { select: { tasks: true } },
              },
              orderBy: { name: 'asc' },
            }),
            tx.task.groupBy({
              by: ['projectId'],
              where: { status: 'COMPLETED' },
              _count: { _all: true },
            }),
          ]);
          const completed = new Map(
            completedByProject.map((row) => [row.projectId, row._count._all]),
          );
          return {
            totalProjects,
            totalTasks,
            completedTasks,
            pendingTasks: totalTasks - completedTasks,
            overdueTasks,
            projects: projects.map((project) => {
              const total = project._count.tasks;
              const done = completed.get(project.id) ?? 0;
              return {
                id: project.id,
                name: project.name,
                totalTasks: total,
                completedTasks: done,
                progress: total ? Math.round((done / total) * 100) : 0,
              };
            }),
          };
        },
        { isolationLevel: 'RepeatableRead' },
      );
      return result;
    },
  };
}
