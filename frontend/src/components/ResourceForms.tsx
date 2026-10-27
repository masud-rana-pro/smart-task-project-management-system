import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '../lib/api';
import type { Project, Task } from '../lib/types';
import { Alert, Modal } from './ui';

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Enter a project name.').max(160),
  description: z.string().trim().min(1, 'Describe the project.').max(4000),
});
const taskSchema = z.object({
  title: z.string().trim().min(1, 'Enter a task title.').max(200),
  description: z.string().trim().max(8000),
  projectId: z.uuid('Select a project.'),
  assigneeId: z.uuid('Select an assignee.'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z
    .string()
    .refine(
      (value) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        value >= '1900-01-01' &&
        Number.isFinite(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value,
      'Choose a real calendar date (1900 or later).',
    ),
});
type ProjectFields = z.infer<typeof projectSchema>;
type TaskFields = z.infer<typeof taskSchema>;
export function ProjectForm({
  project,
  onClose,
}: {
  project?: Project;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFields>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? { name: project.name, description: project.description }
      : { name: '', description: '' },
  });
  const mutation = useMutation({
    mutationFn: (data: ProjectFields) =>
      api(
        project ? `/projects/${project.id}` : '/projects',
        project ? 'PATCH' : 'POST',
        data,
      ),
    onSuccess: async () => {
      await client.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== 'session',
      });
      onClose();
    },
  });
  return (
    <Modal
      title={project ? 'Edit project' : 'Create project'}
      onClose={onClose}
    >
      <p className="form-intro">
        Give your team a clear name and purpose to work toward. Both fields are
        required.
      </p>
      <form
        className="resource-form"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        noValidate
      >
        <label>
          <span id={`${fieldId}-name-label`}> Project name </span>
          <input
            {...register('name')}
            aria-labelledby={`${fieldId}-name-label`}
            aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
            maxLength={160}
            aria-invalid={!!errors.name}
            autoFocus
          />
          {errors.name && (
            <span className="field-error" id={`${fieldId}-name-error`}>
              {errors.name.message}
            </span>
          )}
        </label>
        <label>
          <span id={`${fieldId}-description-label`}> Description </span>
          <textarea
            {...register('description')}
            aria-labelledby={`${fieldId}-description-label`}
            aria-describedby={
              errors.description ? `${fieldId}-description-error` : undefined
            }
            rows={4}
            maxLength={4000}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <span className="field-error" id={`${fieldId}-description-error`}>
              {errors.description.message}
            </span>
          )}
        </label>
        <Alert error={mutation.error} />
        <div className="form-actions">
          <button className="secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Saving…'
              : project
                ? 'Save project'
                : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function TaskForm({
  task,
  onClose,
}: {
  task?: Task;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const fieldId = useId();
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<{ projects: Project[] }>('/projects'),
  });
  const users = useQuery({
    queryKey: ['assignees'],
    queryFn: () =>
      api<{ users: { id: string; name: string }[] }>('/users/assignees'),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFields>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          projectId: task.projectId,
          assigneeId: task.assigneeId,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        }
      : {
          title: '',
          description: '',
          projectId: '',
          assigneeId: '',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '',
        },
  });
  const mutation = useMutation({
    mutationFn: (data: TaskFields) =>
      api(task ? `/tasks/${task.id}` : '/tasks', task ? 'PATCH' : 'POST', data),
    onSuccess: async () => {
      await client.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== 'session',
      });
      onClose();
    },
  });
  return (
    <Modal title={task ? 'Edit task' : 'Create task'} onClose={onClose}>
      <p className="form-intro">
        Set the work, owner and deadline. All fields except description are
        required.
      </p>
      <form
        className="resource-form"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        noValidate
      >
        <label>
          <span id={`${fieldId}-title-label`}> Task title </span>
          <input
            {...register('title')}
            aria-labelledby={`${fieldId}-title-label`}
            aria-describedby={
              errors.title ? `${fieldId}-title-error` : undefined
            }
            maxLength={200}
            aria-invalid={!!errors.title}
            autoFocus
          />
          {errors.title && (
            <span className="field-error" id={`${fieldId}-title-error`}>
              {errors.title.message}
            </span>
          )}
        </label>
        <label>
          <span id={`${fieldId}-description-label`}> Description </span>
          <textarea
            {...register('description')}
            aria-labelledby={`${fieldId}-description-label`}
            aria-describedby={
              errors.description ? `${fieldId}-description-error` : undefined
            }
            maxLength={8000}
            rows={3}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <span className="field-error" id={`${fieldId}-description-error`}>
              {errors.description.message}
            </span>
          )}
          <span className="field-hint">
            Optional. Add context or acceptance details.
          </span>
        </label>
        <div className="form-grid">
          <label>
            <span id={`${fieldId}-projectId-label`}> Project </span>
            <select
              {...register('projectId')}
              aria-labelledby={`${fieldId}-projectId-label`}
              aria-describedby={
                errors.projectId ? `${fieldId}-projectId-error` : undefined
              }
              aria-invalid={!!errors.projectId}
            >
              <option value="">Select project</option>
              {projects.data?.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <span className="field-error" id={`${fieldId}-projectId-error`}>
                {errors.projectId.message}
              </span>
            )}
          </label>
          <label>
            <span id={`${fieldId}-assigneeId-label`}> Assignee </span>
            <select
              {...register('assigneeId')}
              aria-labelledby={`${fieldId}-assigneeId-label`}
              aria-describedby={
                errors.assigneeId ? `${fieldId}-assigneeId-error` : undefined
              }
              aria-invalid={!!errors.assigneeId}
            >
              <option value="">Select assignee</option>
              {users.data?.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {errors.assigneeId && (
              <span className="field-error" id={`${fieldId}-assigneeId-error`}>
                {errors.assigneeId.message}
              </span>
            )}
          </label>
          <label>
            Status
            <select {...register('status')}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>
          <label>
            Priority
            <select {...register('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>
        </div>
        <label>
          <span id={`${fieldId}-dueDate-label`}> Due date </span>
          <input
            {...register('dueDate')}
            aria-labelledby={`${fieldId}-dueDate-label`}
            aria-describedby={[
              `${fieldId}-dueDate-hint`,
              errors.dueDate ? `${fieldId}-dueDate-error` : undefined,
            ]
              .filter(Boolean)
              .join(' ')}
            type="date"
            min="1900-01-01"
            max="9999-12-31"
            aria-invalid={!!errors.dueDate}
          />
          <span className="field-hint" id={`${fieldId}-dueDate-hint`}>
            Due through the end of this day in Bangladesh time.
          </span>
          {errors.dueDate && (
            <span className="field-error" id={`${fieldId}-dueDate-error`}>
              {errors.dueDate.message}
            </span>
          )}
        </label>
        <Alert error={projects.error ?? users.error ?? mutation.error} />
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={mutation.isPending || !projects.data || !users.data}
          >
            {mutation.isPending
              ? 'Saving…'
              : task
                ? 'Save task'
                : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
