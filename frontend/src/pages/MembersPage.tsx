import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../lib/api';
import { useSession } from '../lib/session';
import { Alert, Loading, PageHeading } from '../components/ui';

const schema = z
  .object({
    memberId: z.uuid('Select a Team Member.'),
    password: z.string().min(12, 'Use at least 12 characters.').max(128),
    confirmation: z.string(),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ['confirmation'],
    message: 'Passwords must match.',
  });
type Fields = z.infer<typeof schema>;
export default function MembersPage() {
  const { user } = useSession();
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <MemberPasswordForm />;
}
function MemberPasswordForm() {
  const members = useQuery({
    queryKey: ['admin-members'],
    queryFn: () =>
      api<{ users: { id: string; name: string; email: string }[] }>(
        '/auth/members',
      ),
  });
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { memberId: '', password: '', confirmation: '' },
  });
  const selectedId = useWatch({ control, name: 'memberId' });
  const selected = members.data?.users.find(
    (member) => member.id === selectedId,
  );
  const mutation = useMutation({
    mutationFn: (data: Fields) =>
      api(`/auth/members/${data.memberId}/reset-password`, 'POST', {
        password: data.password,
      }),
    onSuccess: () => reset(),
  });
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="Member access"
        description="Help a Team Member regain access to the workspace."
      />
      <section className="password-reset-panel">
        <h2>Reset member password</h2>
        <p>
          Confirm the member’s identity directly before resetting their
          password. Their existing sessions will end. Share the new password
          privately.
        </p>
        <Alert error={members.error} />
        {members.isPending ? (
          <Loading />
        ) : (
          members.data && (
            <form
              onSubmit={handleSubmit((data) => mutation.mutate(data))}
              onChange={() => {
                if (mutation.isSuccess) mutation.reset();
              }}
            >
              <label htmlFor="reset-member">Team Member</label>
              <select
                id="reset-member"
                {...register('memberId')}
                aria-invalid={!!errors.memberId}
                aria-describedby={
                  errors.memberId ? 'reset-member-error' : undefined
                }
              >
                <option value="">Select a Team Member</option>
                {members.data.users.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <p id="reset-member-error" className="field-error">
                  {errors.memberId.message}
                </p>
              )}
              <label htmlFor="reset-password">New password</label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-describedby="reset-password-help"
              />
              <p id="reset-password-help" className="field-error">
                {errors.password?.message ?? 'Use 12–128 characters.'}
              </p>
              <label htmlFor="reset-confirmation">Confirm new password</label>
              <input
                id="reset-confirmation"
                type="password"
                autoComplete="new-password"
                {...register('confirmation')}
                aria-invalid={!!errors.confirmation}
                aria-describedby={
                  errors.confirmation ? 'reset-confirmation-error' : undefined
                }
              />
              {errors.confirmation && (
                <p id="reset-confirmation-error" className="field-error">
                  {errors.confirmation.message}
                </p>
              )}
              <label className="reset-confirmation">
                <input type="checkbox" required key={selectedId} /> I confirm
                this reset is for {selected?.email ?? 'the selected member'} and
                will sign them out.
              </label>
              <Alert error={mutation.error} />
              <button
                type="submit"
                className="button primary"
                disabled={mutation.isPending || !members.data.users.length}
              >
                {mutation.isPending ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )
        )}
        {mutation.isSuccess && (
          <p role="status">
            Password reset. Existing sessions are no longer valid.
          </p>
        )}
      </section>
    </>
  );
}
