import 'dotenv/config';
import { createDatabase } from './db.js';
import { registration } from './validation.js';
import { hashPassword } from './passwords.js';
import { bangladeshDate, dateValue } from './dates.js';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const seed = process.argv[2] === 'seed';
  if (!seed && process.argv[2] !== 'admin')
    throw new Error('Use admin or seed');
  const target = new URL(process.env.DATABASE_URL);
  if (
    seed &&
    (process.env.ALLOW_DEMO_SEED !== 'true' ||
      process.env.NODE_ENV === 'production' ||
      target.hostname !== '127.0.0.1' ||
      !['/smart_task_dev', '/smart_task_test'].includes(target.pathname))
  ) {
    throw new Error(
      'Demo seed requires explicit opt-in and an isolated local smart_task database',
    );
  }
  const adminInput = registration.parse({
    name: process.env.ADMIN_NAME ?? 'Demo Administrator',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  if (adminInput.password.startsWith('REPLACE'))
    throw new Error('Replace the Admin password placeholder locally');
  const database = createDatabase(process.env.DATABASE_URL);
  const db = database.db;
  try {
    const existing = await db.user.findUnique({
      where: { email: adminInput.email },
    });
    if (existing && existing.role !== 'ADMIN')
      throw new Error('Existing member cannot be promoted through bootstrap');
    const admin =
      existing ??
      (await db.user.create({
        data: {
          name: adminInput.name,
          email: adminInput.email,
          role: 'ADMIN',
          passwordHash: await hashPassword(adminInput.password),
        },
      }));
    if (!seed) {
      console.log(
        'Administrator account is available. Existing passwords were not changed.',
      );
      return;
    }
    const memberPassword = registration.shape.password.parse(
      process.env.DEMO_MEMBER_PASSWORD,
    );
    if (memberPassword.startsWith('REPLACE'))
      throw new Error('Replace the member password placeholder locally');
    const members: { id: string }[] = [];
    for (const [name, email] of [
      ['Demo Team Member One', 'member.one@example.invalid'],
      ['Demo Team Member Two', 'member.two@example.invalid'],
    ] as const) {
      const existingMember = await db.user.findUnique({ where: { email } });
      if (existingMember && existingMember.role !== 'TEAM_MEMBER')
        throw new Error(
          'Unexpected role on a seed member; no role changes permitted',
        );
      members.push(
        existingMember ??
          (await db.user.create({
            data: {
              name,
              email,
              passwordHash: await hashPassword(memberPassword),
            },
          })),
      );
    }
    const projectId = '91000000-0000-4000-8000-000000000001';
    const emptyProjectId = '91000000-0000-4000-8000-000000000002';
    const today = dateValue(bangladeshDate());
    const offset = (days: number) => {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + days);
      return date;
    };
    await db.$transaction(async (tx) => {
      await tx.project.upsert({
        where: { id: projectId },
        update: {},
        create: {
          id: projectId,
          name: 'Website launch',
          description:
            'Fictional project for exploring tasks, filters and progress.',
          createdById: admin.id,
        },
      });
      await tx.project.upsert({
        where: { id: emptyProjectId },
        update: {},
        create: {
          id: emptyProjectId,
          name: 'Planning workspace',
          description: 'An empty fictional project for the zero-task state.',
          createdById: admin.id,
        },
      });
      const tasks = [
        {
          title: 'Review the launch checklist',
          status: 'TODO' as const,
          priority: 'HIGH' as const,
          dueDate: offset(-2),
          assigneeId: members[0]!.id,
        },
        {
          title: 'Prepare the interface review',
          status: 'IN_PROGRESS' as const,
          priority: 'MEDIUM' as const,
          dueDate: today,
          assigneeId: members[1]!.id,
        },
        {
          title: 'Confirm project requirements',
          status: 'COMPLETED' as const,
          priority: 'LOW' as const,
          dueDate: offset(-3),
          assigneeId: members[0]!.id,
        },
        {
          title: 'Write the demonstration notes',
          status: 'TODO' as const,
          priority: 'LOW' as const,
          dueDate: offset(7),
          assigneeId: members[1]!.id,
        },
      ];
      for (const [index, task] of tasks.entries()) {
        const id = `92000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
        await tx.task.upsert({
          where: { id },
          update: {},
          create: {
            ...task,
            id,
            projectId,
            createdById: admin.id,
            description: 'Fictional development sample; no real customer data.',
          },
        });
      }
    });
    console.log(
      'Demo seed complete: two projects, four tasks and two member accounts. Existing records/passwords were preserved.',
    );
  } finally {
    await database.close();
  }
}

try {
  await main();
} catch (error) {
  // Never print raw ORM exceptions, environment values or password validation input.
  console.error(
    'Account setup failed. Check the documented environment, opt-in and target. Error type:',
    error instanceof Error ? error.name : 'unknown',
  );
  process.exitCode = 1;
}
