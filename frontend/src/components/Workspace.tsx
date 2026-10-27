import { useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../lib/session';
import { api } from '../lib/api';
import type { NoticeList } from '../lib/types';
import { Alert, Loading } from './ui';
import Icon from './Icon';

// eslint-disable-next-line react-refresh/only-export-components
export function useNotices() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<NoticeList>('/notifications'),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  });
}
function AuthenticatedWorkspace() {
  const { user, signOut } = useSession();
  const notices = useNotices();
  const location = useLocation();
  const [logoutError, setLogoutError] = useState<unknown>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const page =
    (
      {
        projects: 'Projects',
        tasks: 'Tasks',
        notifications: 'Notifications',
        members: 'Member access',
      } as Record<string, string>
    )[location.pathname.split('/')[1] ?? ''] ?? 'Overview';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Smart Task home">
          <span className="brand-mark" aria-hidden="true">
            st<span>•</span>
          </span>
          smart task<span className="brand-dot">.</span>
        </NavLink>
        <div className="workspace-label">
          <span className="workspace-monogram">W</span>
          <div>
            Team workspace<small>Shared space, shared progress</small>
          </div>
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {[
            { to: '/', label: 'Overview', icon: 'dashboard' as const },
            { to: '/projects', label: 'Projects', icon: 'projects' as const },
            { to: '/tasks', label: 'Tasks', icon: 'tasks' as const },
            {
              to: '/notifications',
              label: 'Notifications',
              icon: 'bell' as const,
            },
          ].map((item) => (
            <NavLink end={item.to === '/'} key={item.to} to={item.to}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.icon === 'bell' && !!notices.data?.unreadCount && (
                <span
                  className="nav-count"
                  aria-label={`${notices.data.unreadCount} unread`}
                >
                  {notices.data.unreadCount}
                </span>
              )}
            </NavLink>
          ))}
          {user?.role === 'ADMIN' && (
            <NavLink to="/members">
              <Icon name="tasks" />
              <span>Member access</span>
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="team-note">
            <span aria-hidden="true">✧</span>
            <h3>A little more organized.</h3>
            <p>A little closer to done.</p>
          </div>
          <div className="profile">
            <span className="avatar">{user?.name.slice(0, 1)}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>
                {user?.role === 'ADMIN' ? 'Administrator' : 'Team member'}
              </small>
            </div>
          </div>
          <button
            className="logout-button"
            disabled={loggingOut}
            onClick={() => {
              setLoggingOut(true);
              void signOut()
                .catch(setLogoutError)
                .finally(() => setLoggingOut(false));
            }}
          >
            <Icon name="logout" />
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
          <Alert error={logoutError} />
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              Workspace <span aria-hidden="true">/</span>
            </span>{' '}
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <span className="timezone">Asia/Dhaka</span>
            <NavLink
              to="/notifications"
              className="notification-link"
              aria-label={`Notifications, ${notices.data?.unreadCount ?? 0} unread`}
            >
              <Icon name="bell" />
              {!!notices.data?.unreadCount && (
                <span className="notification-dot" />
              )}
            </NavLink>
            <span
              className="avatar small"
              aria-label={`Signed in as ${user?.name}`}
            >
              {user?.name.slice(0, 1)}
            </span>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="page-content">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>Made for focused work.</span>
          <span>Smart Task · Team workspace</span>
        </footer>
      </div>
    </div>
  );
}
export default function Workspace() {
  const { user, pending, error, refresh } = useSession();
  if (pending) return <Loading />;
  if (error)
    return (
      <main id="main" className="connection-error">
        <h1>Let’s reconnect.</h1>
        <Alert error={error} />
        <button onClick={refresh}>Retry connection</button>
      </main>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <AuthenticatedWorkspace />;
}
