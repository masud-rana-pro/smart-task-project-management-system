import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Dashboard, Project } from '../lib/types';
import { useSession } from '../lib/session';
import {
  Alert,
  DeleteDialog,
  Empty,
  Loading,
  PageHeading,
} from '../components/ui';
import { ProjectForm } from '../components/ResourceForms';
import Icon from '../components/Icon';

export default function ProjectsPage() {
  const { user } = useSession();
  const admin = user?.role === 'ADMIN';
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<{ projects: Project[] }>('/projects'),
  });
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<Dashboard>('/dashboard'),
  });
  return (
    <>
      <PageHeading
        eyebrow="From plan to progress"
        title="Projects"
        description="One place for every initiative your team is moving forward."
        action={
          admin && (
            <button onClick={() => setEditing('new')}>
              <Icon name="plus" />
              Create project
            </button>
          )
        }
      />
      <Alert error={projects.error ?? dashboard.error} />
      {projects.error && (
        <button className="secondary" onClick={() => void projects.refetch()}>
          Retry projects
        </button>
      )}
      {dashboard.error && (
        <button className="secondary" onClick={() => void dashboard.refetch()}>
          Retry progress
        </button>
      )}
      {projects.isPending ? (
        <Loading />
      ) : !projects.data ? null : !projects.data.projects.length ? (
        <section className="panel">
          <Empty title="Room for your next big idea">
            {admin
              ? 'Create your first project to give your team a clear direction.'
              : 'Projects will appear here when an administrator adds them.'}
          </Empty>
        </section>
      ) : (
        <div className="project-grid">
          {projects.data.projects.map((project, index) => {
            const progress = dashboard.data?.projects.find(
              (item) => item.id === project.id,
            );
            const taskCount = project._count?.tasks ?? 0;
            return (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <span className={`project-icon color-${index % 3}`}>
                    <Icon name="projects" />
                  </span>
                  <span className="muted">
                    {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <h2>
                  <Link to={`/tasks?projectId=${project.id}`}>
                    {project.name}
                  </Link>
                </h2>
                <p className="project-description">{project.description}</p>
                <div className="project-progress">
                  <div>
                    <span>Completion</span>
                    <strong>{progress ? `${progress.progress}%` : '—'}</strong>
                  </div>
                  {progress ? (
                    <>
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label={`${project.name} completion`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress.progress}
                        aria-valuetext={`${progress.completedTasks} of ${progress.totalTasks} tasks complete`}
                      >
                        <span style={{ width: `${progress.progress}%` }} />
                      </div>
                      <p className="project-progress-note">
                        {progress.totalTasks
                          ? `${progress.completedTasks} of ${progress.totalTasks} complete`
                          : 'No tasks yet'}
                      </p>
                    </>
                  ) : (
                    <p className="project-progress-note">
                      {dashboard.error
                        ? 'Progress unavailable'
                        : 'Loading progress…'}
                    </p>
                  )}
                </div>
                <div className="project-card-footer">
                  <Link to={`/tasks?projectId=${project.id}`}>
                    View tasks <Icon name="arrow" />
                  </Link>
                  {admin && (
                    <div className="row-actions">
                      <button
                        className="text-button"
                        onClick={() => setEditing(project)}
                        aria-label={`Edit ${project.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="text-button danger-text"
                        onClick={() => setDeleting(project)}
                        aria-label={`Delete ${project.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {editing && (
        <ProjectForm
          {...(editing !== 'new' ? { project: editing } : {})}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          kind="projects"
          id={deleting.id}
          name={deleting.name}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
