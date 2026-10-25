import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Prisma } from './generated/prisma/client.js';
import type { Database } from './db.js';
import { ApiError } from './errors.js';
import { currentUser, requireAdmin } from './security.js';
import { dateValue, todayValue } from './dates.js';
import * as input from './validation.js';

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

export function workRoutes(db: Database) {
  const router = Router();
  router.get('/users/assignees', async (_req, res) => {
    res.json({
      users: await db.user.findMany({
        select: { id: true, name: true },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      }),
    });
  });
  router.get('/projects', async (_req, res) => {
    res.json({
      projects: await db.project.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: { _count: { select: { tasks: true } } },
      }),
    });
  });
  router.get('/projects/:id', async (req, res) => {
    const project = await db.project.findUnique({
      where: { id: input.uuid.parse(req.params.id) },
    });
    if (!project) throw new ApiError(404, 'NOT_FOUND', 'Project not found.');
    res.json({ project });
  });
  router.post('/projects', requireAdmin, async (req, res) => {
    const data = input.projectInput.parse(req.body);
    res.status(201).json({
      project: await db.project.create({
        data: { ...data, createdById: currentUser(req).id },
      }),
    });
  });
  async function updateProject(req: Request, res: Response) {
    const data = (
      req.method === 'PUT'
        ? input.projectInput
        : input.projectInput
            .partial()
            .refine(
              (value) => Object.keys(value).length > 0,
              'Provide at least one field.',
            )
    ).parse(req.body);
    res.json({
      project: await db.project.update({
        where: { id: input.uuid.parse(req.params.id) },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
        },
      }),
    });
  }
  router.patch('/projects/:id', requireAdmin, updateProject);
  router.put('/projects/:id', requireAdmin, updateProject);
  router.delete('/projects/:id', requireAdmin, async (req, res) => {
    // The DB's ON DELETE RESTRICT handles concurrent task creation safely.
    await db.project.delete({ where: { id: input.uuid.parse(req.params.id) } });
    res.status(204).end();
  });

  router.get('/tasks', async (req, res) => {
    const query = input.taskQuery.parse(req.query);
    const where: Prisma.TaskWhereInput = {
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.search
        ? {
            OR: [
              {
                title: { contains: query.search, mode: 'insensitive' as const },
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
    res.json({
      tasks: tasks.map(taskJson),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  });
  router.get('/tasks/:id', async (req, res) => {
    const task = await db.task.findUnique({
      where: { id: input.uuid.parse(req.params.id) },
      include: taskInclude,
    });
    if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found.');
    res.json({ task: taskJson(task) });
  });
  router.post('/tasks', requireAdmin, async (req, res) => {
    const data = input.taskInput.parse(req.body);
    await validateReferences(db, data);
    const task = await db.task.create({
      data: {
        ...data,
        dueDate: dateValue(data.dueDate),
        createdById: currentUser(req).id,
      },
      include: taskInclude,
    });
    res.status(201).json({ task: taskJson(task) });
  });
  async function updateTask(req: Request, res: Response) {
    const data = (
      req.method === 'PUT' ? input.taskInput : input.taskPatch
    ).parse(req.body);
    await validateReferences(db, data);
    const task = await db.task.update({
      where: { id: input.uuid.parse(req.params.id) },
      data: {
        ...data,
        ...(data.dueDate ? { dueDate: dateValue(data.dueDate) } : {}),
      } as Prisma.TaskUncheckedUpdateInput,
      include: taskInclude,
    });
    res.json({ task: taskJson(task) });
  }
  router.patch('/tasks/:id', requireAdmin, updateTask);
  router.put('/tasks/:id', requireAdmin, updateTask);
  router.patch('/tasks/:id/status', async (req, res) => {
    const id = input.uuid.parse(req.params.id);
    const { status } = input.taskStatusInput.parse(req.body);
    const user = currentUser(req);
    const result = await db.task.updateMany({
      where: { id, ...(user.role === 'ADMIN' ? {} : { assigneeId: user.id }) },
      data: { status },
    });
    if (!result.count) {
      if (!(await db.task.findUnique({ where: { id }, select: { id: true } })))
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
    res.json({ task: taskJson(task) });
  });
  router.delete('/tasks/:id', requireAdmin, async (req, res) => {
    await db.task.delete({ where: { id: input.uuid.parse(req.params.id) } });
    res.status(204).end();
  });

  router.get('/dashboard', async (_req, res) => {
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
    res.json(result);
  });
  return router;
}
