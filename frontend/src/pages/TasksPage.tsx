import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Project, Task, TaskList, Status } from '../lib/types';
import {
  displayDate,
  isOverdue,
  priorityLabel,
  statusLabel,
} from '../lib/types';
import { useSession } from '../lib/session';
import {
  Alert,
  DeleteDialog,
  Empty,
  Loading,
  Modal,
  PageHeading,
} from '../components/ui';
import { TaskForm } from '../components/ResourceForms';
import Icon from '../components/Icon';

export default function TasksPage() {
  const { user } = useSession();
  const admin = user?.role === 'ADMIN';
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const latestParams = useRef(params);
  const searchParam = params.get('search') ?? '';
  const searchInput = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [viewing, setViewing] = useState<Task | null>(null);
  const [notice, setNotice] = useState('');
  const query = new URLSearchParams(params);
  query.set('pageSize', '10');
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<{ projects: Project[] }>('/projects'),
  });
  const users = useQuery({
    queryKey: ['assignees'],
    queryFn: () =>
      api<{ users: { id: string; name: string }[] }>('/users/assignees'),
  });
  const tasks = useQuery({
    queryKey: ['tasks', query.toString()],
    queryFn: () => api<TaskList>('/tasks?' + query),
  });
  // Synchronize before another input event or debounce callback can merge filters.
  useLayoutEffect(() => {
    latestParams.current = params;
  }, [params]);
  useEffect(() => {
    if (searchInput.current) searchInput.current.value = searchParam;
  }, [searchParam]);
  useEffect(() => () => clearTimeout(searchTimer.current), []);
  function filter(key: string, value: string) {
    if (key === 'search') clearTimeout(searchTimer.current);
    const next = new URLSearchParams(latestParams.current);
    if ((next.get(key) ?? '') === value) return;
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    latestParams.current = next;
    setParams(next);
  }
  const status = useMutation({
    mutationFn: ({ id, value }: { id: string; value: Status }) =>
      api(`/tasks/${id}/status`, 'PATCH', { status: value }),
    onSuccess: async () => {
      setNotice('Task status updated.');
      await client.invalidateQueries({
        predicate: (item) => item.queryKey[0] !== 'session',
      });
    },
  });
  function resetFilters() {
    clearTimeout(searchTimer.current);
    if (searchInput.current) searchInput.current.value = '';
    latestParams.current = new URLSearchParams();
    setParams({});
  }
  const activeFilters = [
    {
      key: 'projectId',
      label: 'Project',
      value:
        projects.data?.projects.find(
          (item) => item.id === params.get('projectId'),
        )?.name ?? 'Selected project',
    },
    {
      key: 'status',
      label: 'Status',
      value: statusLabel[params.get('status') as Status] ?? 'Selected status',
    },
    {
      key: 'priority',
      label: 'Priority',
      value:
        priorityLabel[params.get('priority') as keyof typeof priorityLabel] ??
        'Selected priority',
    },
    {
      key: 'assigneeId',
      label: 'Assignee',
      value:
        users.data?.users.find((item) => item.id === params.get('assigneeId'))
          ?.name ?? 'Selected assignee',
    },
    { key: 'search', label: 'Search', value: searchParam },
  ].filter((item) => params.get(item.key));
  const pagination = tasks.data?.pagination;
  const rangeStart =
    pagination && tasks.data?.tasks.length
      ? (pagination.page - 1) * pagination.pageSize + 1
      : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.total)
    : 0;
  return (
    <>
      <PageHeading
        eyebrow="Make the next move"
        title="Tasks"
        description="Everything that needs doing, with a clear owner and next step."
        action={
          admin && (
            <button onClick={() => setEditing('new')}>
              <Icon name="plus" />
              Create task
            </button>
          )
        }
      />
      <section className="panel tasks-panel">
        <div className="task-list-heading">
          <div>
            <h2>Your task list</h2>
            <p>Find the right work. Keep the next step moving.</p>
          </div>
          <span className="task-scope">Shared workspace</span>
        </div>
        <div className="task-toolbar">
          <div className="search-field">
            <Icon name="search" />
            <input
              aria-label="Search tasks"
              placeholder="Search tasks or descriptions…"
              ref={searchInput}
              defaultValue={searchParam}
              maxLength={200}
              onChange={(event) => {
                const value = event.target.value.trim();
                clearTimeout(searchTimer.current);
                searchTimer.current = setTimeout(
                  () => filter('search', value),
                  350,
                );
              }}
            />
          </div>
          <span className="result-count" role="status">
            {tasks.data
              ? `${tasks.data.pagination.total} ${tasks.data.pagination.total === 1 ? 'task' : 'tasks'}`
              : 'Finding tasks…'}
          </span>
        </div>
        <div className="filters">
          <label>
            Project
            <select
              value={params.get('projectId') ?? ''}
              onChange={(event) => filter('projectId', event.target.value)}
            >
              <option value="">All projects</option>
              {projects.data?.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={params.get('status') ?? ''}
              onChange={(event) => filter('status', event.target.value)}
            >
              <option value="">All statuses</option>
              {Object.entries(statusLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={params.get('priority') ?? ''}
              onChange={(event) => filter('priority', event.target.value)}
            >
              <option value="">All priorities</option>
              {Object.entries(priorityLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assignee
            <select
              value={params.get('assigneeId') ?? ''}
              onChange={(event) => filter('assigneeId', event.target.value)}
            >
              <option value="">All assignees</option>
              {users.data?.users.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                  {person.id === user?.id ? ' (you)' : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select
              value={`${params.get('sortBy') ?? 'createdAt'}:${params.get('sortOrder') ?? 'desc'}`}
              onChange={(event) => {
                const [key, direction] = event.target.value.split(':');
                const next = new URLSearchParams(latestParams.current);
                next.set('sortBy', key!);
                next.set('sortOrder', direction!);
                next.delete('page');
                latestParams.current = next;
                setParams(next);
              }}
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="dueDate:asc">Due date: earliest</option>
              <option value="dueDate:desc">Due date: latest</option>
              <option value="title:asc">Title: A–Z</option>
              <option value="title:desc">Title: Z–A</option>
              <option value="priority:desc">Priority: high first</option>
            </select>
          </label>
          <button className="text-button reset-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
        {!!activeFilters.length && (
          <div className="active-task-filters" aria-label="Active task filters">
            <span>Filtered by</span>
            {activeFilters.map((item) => (
              <button
                key={item.key}
                className="task-filter-chip"
                aria-label={`Remove ${item.label} filter`}
                onClick={() => filter(item.key, '')}
              >
                <span>
                  {item.label}: <strong>{item.value}</strong>
                </span>
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
        <Alert
          error={tasks.error ?? projects.error ?? users.error ?? status.error}
        />
        {tasks.error && (
          <button className="secondary" onClick={() => void tasks.refetch()}>
            Retry tasks
          </button>
        )}
        <span className="sr-only" role="status">
          {notice}
        </span>
        {tasks.isPending ? (
          <Loading />
        ) : !tasks.data ? null : !tasks.data.tasks.length ? (
          <Empty
            title={
              tasks.data.pagination.page > 1 && tasks.data.pagination.total > 0
                ? 'That page is empty'
                : 'No tasks to show'
            }
          >
            {params.size
              ? 'Try a different search or reset your filters.'
              : admin
                ? 'Create a task and give the next step an owner.'
                : 'New tasks will appear here when your team adds them.'}
          </Empty>
        ) : (
          <>
            <div className="table-scroll">
              <table className="task-table" role="table">
                <caption className="sr-only">
                  Tasks in the shared workspace
                </caption>
                <thead role="rowgroup">
                  <tr role="row">
                    <th scope="col">Task</th>
                    <th scope="col">Project</th>
                    <th scope="col">Assignee</th>
                    <th scope="col">Due date</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col">{admin ? 'Actions' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {tasks.data.tasks.map((task) => (
                    <tr key={task.id} role="row">
                      <td
                        className="task-title-cell"
                        role="cell"
                        data-label="Task"
                      >
                        <button
                          className="task-title"
                          onClick={() =>
                            admin ? setEditing(task) : setViewing(task)
                          }
                        >
                          {task.title}
                        </button>
                        <span className="task-description">
                          {task.description || 'No description'}
                        </span>
                      </td>
                      <td role="cell" data-label="Project">
                        {task.project.name}
                      </td>
                      <td role="cell" data-label="Assignee">
                        <span className="assignee">
                          <span className="avatar small">
                            {task.assignee.name.slice(0, 1)}
                          </span>
                          {task.assignee.name}
                        </span>
                      </td>
                      <td role="cell" data-label="Due date">
                        <span className={isOverdue(task) ? 'overdue' : ''}>
                          {displayDate(task.dueDate)}
                        </span>
                        {isOverdue(task) && (
                          <small className="overdue block">Overdue</small>
                        )}
                      </td>
                      <td role="cell" data-label="Priority">
                        <span
                          className={`priority ${task.priority.toLowerCase()}`}
                        >
                          <span aria-hidden="true">●</span>{' '}
                          {priorityLabel[task.priority]}
                        </span>
                      </td>
                      <td role="cell" data-label="Status">
                        {admin || task.assigneeId === user?.id ? (
                          <select
                            className={`status-select ${task.status.toLowerCase()}`}
                            aria-label={`Status for ${task.title}`}
                            value={task.status}
                            disabled={status.isPending}
                            onChange={(event) => {
                              setNotice('');
                              status.mutate({
                                id: task.id,
                                value: event.target.value as Status,
                              });
                            }}
                          >
                            {Object.entries(statusLabel).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          <span
                            className={`badge ${task.status.toLowerCase()}`}
                          >
                            {statusLabel[task.status]}
                          </span>
                        )}
                      </td>
                      <td
                        role="cell"
                        data-label={admin ? 'Actions' : 'Details'}
                      >
                        {admin ? (
                          <div className="row-actions">
                            <button
                              className="text-button"
                              onClick={() => setEditing(task)}
                              aria-label={`Edit ${task.title}`}
                            >
                              Edit
                            </button>
                            <button
                              className="text-button danger-text"
                              onClick={() => setDeleting(task)}
                              aria-label={`Delete ${task.title}`}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="muted">
                            {task.assigneeId === user?.id
                              ? 'Assigned to you'
                              : 'View only'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <div className="pagination-summary">
                <span className="task-range">
                  Showing {rangeStart}–{rangeEnd} of{' '}
                  {tasks.data.pagination.total}{' '}
                  {tasks.data.pagination.total === 1 ? 'task' : 'tasks'}
                </span>
                <span>
                  Page {tasks.data.pagination.page} of{' '}
                  {Math.max(1, tasks.data.pagination.totalPages)}
                </span>
              </div>
              <div>
                <button
                  className="secondary"
                  disabled={tasks.data.pagination.page <= 1}
                  onClick={() =>
                    setParams((previous) => {
                      const next = new URLSearchParams(previous);
                      next.set('page', String(tasks.data!.pagination.page - 1));
                      return next;
                    })
                  }
                >
                  Previous
                </button>
                <button
                  className="secondary"
                  disabled={
                    tasks.data.pagination.page >=
                    tasks.data.pagination.totalPages
                  }
                  onClick={() =>
                    setParams((previous) => {
                      const next = new URLSearchParams(previous);
                      next.set('page', String(tasks.data!.pagination.page + 1));
                      return next;
                    })
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        {tasks.data &&
          tasks.data.tasks.length === 0 &&
          tasks.data.pagination.page > 1 && (
            <button className="secondary" onClick={() => filter('page', '')}>
              Return to first page
            </button>
          )}
      </section>
      {!admin && (
        <p className="page-footnote">
          You can view all tasks and update the status of tasks assigned to you.
        </p>
      )}
      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          <p className="task-detail-description">
            {viewing.description || 'No description provided.'}
          </p>
          <dl className="task-details">
            <dt>Project</dt>
            <dd>{viewing.project.name}</dd>
            <dt>Assignee</dt>
            <dd>{viewing.assignee.name}</dd>
            <dt>Due date</dt>
            <dd>{displayDate(viewing.dueDate)}</dd>
            <dt>Priority</dt>
            <dd>{priorityLabel[viewing.priority]}</dd>
            <dt>Status</dt>
            <dd>{statusLabel[viewing.status]}</dd>
          </dl>
        </Modal>
      )}
      {editing && (
        <TaskForm
          {...(editing !== 'new' ? { task: editing } : {})}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          kind="tasks"
          id={deleting.id}
          name={deleting.title}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
