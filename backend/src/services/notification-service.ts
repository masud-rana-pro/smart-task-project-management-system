import type { Database } from '../db.js';
import type { Identity } from '../security.js';
import { todayValue } from '../dates.js';
import { ApiError } from '../errors.js';
export function createNotificationService(db: Database) {
  return {
    async list(user: Pick<Identity, 'id' | 'role'>) {
      const admin = user.role === 'ADMIN';
      const today = todayValue();
      const result = await db.$transaction(async (tx) => {
        // Deduplication and date matching happen in PostgreSQL; all values are parameterized.
        await tx.$executeRaw`
        INSERT INTO notifications (id, recipient_id, task_id, due_date_snapshot, kind)
        SELECT gen_random_uuid(), ${user.id}::uuid, id, due_date, 'OVERDUE'::"NotificationKind"
        FROM tasks WHERE due_date < ${today}::date AND status <> 'COMPLETED' AND (${admin} OR assignee_id = ${user.id}::uuid)
        ON CONFLICT (recipient_id, task_id, due_date_snapshot, kind) DO NOTHING`;
        if (!admin)
          await tx.notification.deleteMany({
            where: {
              recipientId: user.id,
              task: { assigneeId: { not: user.id } },
            },
          });
        const notifications = await tx.$queryRaw<
          {
            id: string;
            taskId: string;
            title: string;
            dueDate: string;
            readAt: Date | null;
            createdAt: Date;
          }[]
        >`
        SELECT n.id, n.task_id AS "taskId", t.title, to_char(t.due_date, 'YYYY-MM-DD') AS "dueDate", n.read_at AS "readAt", n.created_at AS "createdAt"
        FROM notifications n JOIN tasks t ON t.id = n.task_id
        WHERE n.recipient_id = ${user.id}::uuid AND n.due_date_snapshot = t.due_date
          AND t.due_date < ${today}::date AND t.status <> 'COMPLETED' AND (${admin} OR t.assignee_id = ${user.id}::uuid)
        ORDER BY (n.read_at IS NULL) DESC, n.created_at DESC, n.id ASC LIMIT 50`;
        const counts = await tx.$queryRaw<{ unread: bigint }[]>`
        SELECT count(*) AS unread FROM notifications n JOIN tasks t ON t.id = n.task_id
        WHERE n.recipient_id = ${user.id}::uuid AND n.read_at IS NULL AND n.due_date_snapshot = t.due_date
          AND t.due_date < ${today}::date AND t.status <> 'COMPLETED' AND (${admin} OR t.assignee_id = ${user.id}::uuid)`;
        return { notifications, unreadCount: Number(counts[0]?.unread ?? 0) };
      });
      return result;
    },
    async markRead(id: string, userId: string) {
      const result = await db.notification.updateMany({
        where: {
          id: id,
          recipientId: userId,
        },
        data: { readAt: new Date() },
      });
      if (!result.count)
        throw new ApiError(404, 'NOT_FOUND', 'Notification not found.');
    },
  };
}
