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
            return (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <span className={`project-icon color-${index % 3}`}>
                    <Icon name="projects" />
                  </span>
                  <span className="muted">
                    {project._count?.tasks ?? 0} tasks
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
                    <span>Progress</span>
                    <strong>{progress ? `${progress.progress}%` : '—'}</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${progress?.progress ?? 0}%` }} />
                  </div>
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
