import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../lib/api';
import { useSession } from '../lib/session';
import type { Dashboard, TaskList } from '../lib/types';
import { displayDate, statusLabel, isOverdue } from '../lib/types';
import { Alert, Empty, Loading, PageHeading } from '../components/ui';
import Icon from '../components/Icon';

export default function DashboardPage() {
  const { user } = useSession();
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<Dashboard>('/dashboard'),
  });
  const tasks = useQuery({
    queryKey: ['tasks', 'overview'],
    queryFn: () =>
      api<TaskList>('/tasks?pageSize=5&sortBy=dueDate&sortOrder=asc'),
  });
  if (dashboard.isPending) return <Loading />;
  if (!dashboard.data)
    return (
      <>
        <Alert error={dashboard.error} />
        <button onClick={() => void dashboard.refetch()}>
          Retry dashboard
        </button>
      </>
    );
  const data = dashboard.data;
  const completion = data.totalTasks
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0;
  return (
    <div className="overview-page">
      <PageHeading
        eyebrow="The big picture"
        title={`Hello, ${user?.name.split(' ')[0] ?? 'there'}.`}
        description="A clear view of where things stand, and what comes next."
        action={
          <Link className="button secondary" to="/tasks">
            View all tasks <Icon name="arrow" />
          </Link>
        }
      />
      <section className="welcome-banner">
        <div>
          <span className="banner-kicker">WORKSPACE SNAPSHOT</span>
          <h2>Keep the team moving forward.</h2>
          <p>
            {data.pendingTasks
              ? `Your team has ${data.pendingTasks} pending ${data.pendingTasks === 1 ? 'task' : 'tasks'}. Let’s keep things moving.`
              : data.totalTasks
                ? 'All tasks are complete. Your team is up to date.'
                : user?.role === 'ADMIN'
                  ? 'Create your first project and give the next step an owner.'
                  : 'Your team’s projects and tasks will appear here.'}
          </p>
        </div>
        <div className="workspace-completion">
          <span>Overall completion</span>
          <strong>{completion}%</strong>
          <span>
            {data.completedTasks} of {data.totalTasks} tasks complete
          </span>
        </div>
      </section>
      <section className="stats-grid" aria-label="Workspace totals">
        {[
          {
            label: 'Total projects',
            value: data.totalProjects,
            icon: 'projects' as const,
            color: 'violet',
            detail: 'Across your workspace',
          },
          {
            label: 'Total tasks',
            value: data.totalTasks,
            icon: 'tasks' as const,
            color: 'blue',
            detail: 'Every step, accounted for',
          },
          {
            label: 'Completed',
            value: data.completedTasks,
            icon: 'tasks' as const,
            color: 'green',
            detail: 'Progress worth celebrating',
          },
          {
            label: 'Pending',
            value: data.pendingTasks,
            icon: 'tasks' as const,
            color: 'amber',
            detail: 'To Do + In Progress',
          },
          {
            label: 'Overdue',
            value: data.overdueTasks,
            icon: 'bell' as const,
            color: 'red',
            detail: 'Needs a little attention',
          },
        ].map((stat) => (
          <article
            className="stat-card"
            key={stat.label}
            aria-label={stat.label}
          >
            <span className={`stat-icon ${stat.color}`}>
              <Icon name={stat.icon} />
            </span>
            <span className="stat-label">{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Project progress</h2>
              <p className="muted">Completed tasks, one project at a time.</p>
            </div>
            <Link to="/projects">
              All projects <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {!data.projects.length ? (
            <Empty title="Your next project starts here">
              {user?.role === 'ADMIN'
                ? 'Add a project to see your team’s progress.'
                : 'Project progress will appear when your team adds work.'}
            </Empty>
          ) : (
            <>
              <div
                className="chart"
                aria-label="Project completion percentage chart"
              >
                <ResponsiveContainer width="100%" height={230} minWidth={0}>
                  <BarChart
                    data={data.projects.slice(0, 6)}
                    margin={{ top: 10, right: 8, left: -22, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 4"
                      vertical={false}
                      stroke="#e8e9f0"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) =>
                        String(value).length > 14
                          ? String(value).slice(0, 13) + '…'
                          : String(value)
                      }
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Completed']}
                    />
                    <Bar
                      dataKey="progress"
                      fill="#7061cf"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {data.projects.length > 6 && (
                <p className="chart-caption">
                  Chart shows the first six projects. All projects are listed
                  below.
                </p>
              )}
              <ul
                className="progress-list"
                aria-label="Project completion details"
              >
                {data.projects.map((project) => (
                  <li key={project.id}>
                    <div>
                      <Link to={`/tasks?projectId=${project.id}`}>
                        {project.name}
                      </Link>
                      <span>
                        {project.totalTasks
                          ? `${project.completedTasks} of ${project.totalTasks} complete`
                          : 'No tasks yet'}
                      </span>
                    </div>
                    <div className="progress-row">
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label={`${project.name} completion`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={project.progress}
                        aria-valuetext={`${project.completedTasks} of ${project.totalTasks} tasks complete`}
                      >
                        <span style={{ width: `${project.progress}%` }} />
                      </div>
                      <strong>{project.progress}%</strong>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Task deadlines</h2>
              <p className="muted">The earliest deadlines across the team.</p>
            </div>
            <Link to="/tasks" aria-label="View all tasks">
              <Icon name="arrow" />
            </Link>
          </div>
          <Alert error={tasks.error} />
          {tasks.error ? (
            <div className="deadline-retry">
              <button
                className="secondary"
                onClick={() => void tasks.refetch()}
              >
                Retry deadlines
              </button>
            </div>
          ) : tasks.isPending ? (
            <Loading />
          ) : !tasks.data?.tasks.length ? (
            <Empty title="A little breathing room">
              Tasks will appear here once they’re added.
            </Empty>
          ) : (
            <ul className="activity-list">
              {tasks.data.tasks.map((task) => (
                <li key={task.id}>
                  <span className={`task-dot ${task.status.toLowerCase()}`} />
                  <div>
                    <Link
                      to={`/tasks?search=${encodeURIComponent(task.title)}`}
                    >
                      {task.title}
                    </Link>
                    <p>{task.project.name}</p>
                    <span className={`due ${isOverdue(task) ? 'overdue' : ''}`}>
                      {displayDate(task.dueDate)}
                      {isOverdue(task) ? ' · Overdue' : ''}
                    </span>
                  </div>
                  <span className={`badge ${task.status.toLowerCase()}`}>
                    {statusLabel[task.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="panel-note">
            Deadlines follow Bangladesh time (Asia/Dhaka).
          </div>
        </section>
      </div>
    </div>
  );
}
