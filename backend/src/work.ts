import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Database } from './db.js';
import { currentUser, requireAdmin } from './security.js';
import { createWorkService } from './services/work-service.js';
import * as input from './validation.js';

export function workRoutes(db: Database) {
  const router = Router();
  const service = createWorkService(db);
  router.get('/users/assignees', async (_req, res) => {
    res.json(await service.listAssignees());
  });
  router.get('/projects', async (_req, res) => {
    res.json(await service.listProjects());
  });
  router.get('/projects/:id', async (req, res) => {
    res.json(await service.getProject(input.uuid.parse(req.params.id)));
  });
  router.post('/projects', requireAdmin, async (req, res) => {
    res
      .status(201)
      .json(
        await service.createProject(
          input.projectInput.parse(req.body),
          currentUser(req).id,
        ),
      );
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
    res.json(
      await service.updateProject(input.uuid.parse(req.params.id), data),
    );
  }
  router.patch('/projects/:id', requireAdmin, updateProject);
  router.put('/projects/:id', requireAdmin, updateProject);
  router.delete('/projects/:id', requireAdmin, async (req, res) => {
    await service.deleteProject(input.uuid.parse(req.params.id));
    res.status(204).end();
  });
  router.get('/tasks', async (req, res) => {
    res.json(await service.listTasks(input.taskQuery.parse(req.query)));
  });
  router.get('/tasks/:id', async (req, res) => {
    res.json(await service.getTask(input.uuid.parse(req.params.id)));
  });
  router.post('/tasks', requireAdmin, async (req, res) => {
    res
      .status(201)
      .json(
        await service.createTask(
          input.taskInput.parse(req.body),
          currentUser(req).id,
        ),
      );
  });
  async function updateTask(req: Request, res: Response) {
    const data = (
      req.method === 'PUT' ? input.taskInput : input.taskPatch
    ).parse(req.body);
    res.json(await service.updateTask(input.uuid.parse(req.params.id), data));
  }
  router.patch('/tasks/:id', requireAdmin, updateTask);
  router.put('/tasks/:id', requireAdmin, updateTask);
  router.patch('/tasks/:id/status', async (req, res) => {
    res.json(
      await service.updateTaskStatus(
        input.uuid.parse(req.params.id),
        input.taskStatusInput.parse(req.body).status,
        currentUser(req),
      ),
    );
  });
  router.delete('/tasks/:id', requireAdmin, async (req, res) => {
    await service.deleteTask(input.uuid.parse(req.params.id));
    res.status(204).end();
  });
  router.get('/dashboard', async (_req, res) => {
    res.json(await service.dashboard());
  });
  return router;
}
