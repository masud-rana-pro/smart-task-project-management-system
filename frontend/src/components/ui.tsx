import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function Alert({ error }: { error: unknown }) {
  return error ? (
    <p className="alert" role="alert">
      {error instanceof Error
        ? error.message
        : 'Something went wrong. Please retry.'}
    </p>
  ) : null;
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Loading your workspace…
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-symbol" aria-hidden="true">
        ◇
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby="modal-title">
      <div className="modal-heading">
        <h2 id="modal-title">{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function DeleteDialog({
  kind,
  id,
  name,
  onClose,
}: {
  kind: 'projects' | 'tasks';
  id: string;
  name: string;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const deletion = useMutation({
    mutationFn: () => api(`/${kind}/${id}`, 'DELETE'),
    onSuccess: async () => {
      await client.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== 'session',
      });
      onClose();
    },
  });
  return (
    <Modal
      title={`Delete ${kind === 'projects' ? 'project' : 'task'}?`}
      onClose={onClose}
    >
      <p>
        Delete <strong>{name}</strong>? This cannot be undone.
        {kind === 'projects' &&
          ' Projects with tasks must have their tasks moved or deleted first.'}
      </p>
      <Alert error={deletion.error} />
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => deletion.mutate()}
          disabled={deletion.isPending}
        >
          {deletion.isPending ? 'Deleting…' : 'Delete permanently'}
        </button>
      </div>
    </Modal>
  );
}
