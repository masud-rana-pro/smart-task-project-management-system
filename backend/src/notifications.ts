import { Router } from 'express';
import type { Database } from './db.js';
import { currentUser } from './security.js';
import { uuid } from './validation.js';
import { createNotificationService } from './services/notification-service.js';

export function notificationRoutes(db: Database) {
  const router = Router();
  const service = createNotificationService(db);
  router.get('/', async (req, res) => {
    res.json(await service.list(currentUser(req)));
  });
  router.patch('/:id/read', async (req, res) => {
    await service.markRead(uuid.parse(req.params.id), currentUser(req).id);
    res.status(204).end();
  });
  return router;
}
