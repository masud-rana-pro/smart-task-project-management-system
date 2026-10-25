import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotices } from '../components/Workspace';
import { api } from '../lib/api';
import { displayDate } from '../lib/types';
import { Alert, Empty, Loading, PageHeading } from '../components/ui';
import Icon from '../components/Icon';
export default function NotificationsPage() {
  const notices = useNotices();
  const client = useQueryClient();
  const read = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}/read`, 'PATCH'),
    onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }),
  });
  return (
    <>
      <PageHeading
        eyebrow="A timely heads-up"
        title="Notifications"
        description="Overdue work that could use your attention."
        action={
          <button
            className="secondary"
            disabled={notices.isFetching}
            onClick={() => void notices.refetch()}
          >
            Refresh notices
          </button>
        }
      />
      <section className="panel">
        <div className="panel-heading">
          <h2>Overdue tasks</h2>
          <span className="badge todo">
            {notices.data?.unreadCount ?? 0} unread
          </span>
        </div>
        <Alert error={notices.error ?? read.error} />
        {notices.isPending ? (
          <Loading />
        ) : !notices.data?.notifications.length ? (
          <Empty title="You’re all caught up">
            No overdue notifications right now. A good place to be.
          </Empty>
        ) : (
          <ul className="notification-list">
            {notices.data.notifications.map((notice) => (
              <li className={!notice.readAt ? 'unread' : ''} key={notice.id}>
                <span className="notification-icon">
                  <Icon name="bell" />
                </span>
                <div>
                  <Link
                    to={`/tasks?search=${encodeURIComponent(notice.title)}`}
                  >
                    {notice.title}
                  </Link>
                  <p>Due {displayDate(notice.dueDate)} · Overdue</p>
                  <small>{notice.readAt ? 'Read' : 'Unread'}</small>
                </div>
                {!notice.readAt && (
                  <button
                    className="secondary"
                    disabled={read.isPending}
                    onClick={() => read.mutate(notice.id)}
                    aria-label={`Mark ${notice.title} as read`}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="panel-note">
          Shows up to 50 current notices, unread first. Refreshes every minute
          while this workspace is active. Completed or rescheduled tasks leave
          this list.
        </div>
      </section>
    </>
  );
}
