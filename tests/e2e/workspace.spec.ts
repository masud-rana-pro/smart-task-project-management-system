import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
import { expectReadableContrast } from './accessibility';

test('Task search, combined filters, sorting, pagination and empty reset work together', async ({
  page,
  workspace,
}) => {
  await login(page, workspace.adminEmail, workspace.password);
  const token = await (await page.request.get('/api/auth/csrf')).json();
  for (let index = 1; index <= 11; index++) {
    const response = await page.request.post('/api/tasks', {
      headers: {
        Origin: 'http://127.0.0.1:5173',
        'x-csrf-token': token.csrfToken,
      },
      data: {
        title: `Pagination step ${String(index).padStart(2, '0')}`,
        projectId: workspace.projectId,
        assigneeId: workspace.memberId,
        priority: 'MEDIUM',
        dueDate: '2026-10-26',
      },
    });
    expect(response.status()).toBe(201);
  }
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();
  await page.getByLabel('Search tasks').fill('Pagination step');
  await page
    .getByRole('combobox', { name: 'Project', exact: true })
    .selectOption(workspace.projectId);
  await page
    .getByRole('combobox', { name: 'Status', exact: true })
    .selectOption('TODO');
  await page
    .getByRole('combobox', { name: 'Priority', exact: true })
    .selectOption('MEDIUM');
  await page
    .getByRole('combobox', { name: 'Assignee', exact: true })
    .selectOption(workspace.memberId);
  await page
    .getByRole('combobox', { name: 'Sort by' })
    .selectOption('title:asc');
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/search=Pagination\+step/);
  await expect(page).toHaveURL(/sortBy=title/);
  await expect(
    page.getByRole('button', { name: 'Pagination step 01', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Pagination step 11', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Page 2 of 2', { exact: true })).toBeVisible();
  await page.getByLabel('Search tasks').fill('nothing-matches-this-search');
  await expect(
    page.getByRole('heading', { name: 'No tasks to show' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Reset filters', exact: true })
    .click();
  await expect(page.getByLabel('Search tasks')).toHaveValue('');
  await expect(
    page.getByRole('heading', { name: 'No tasks to show' }),
  ).toHaveCount(0);
});
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(
    page.getByRole('heading', { name: 'Hello, Browser.' }),
  ).toBeVisible({ timeout: 15_000 });
  await expectReadableContrast(page);
}

test('Admin manages a project and task, filters results, and cannot delete a nonempty project', async ({
  page,
  workspace,
}, info) => {
  await login(page, workspace.adminEmail, workspace.password);
  await page.screenshot({
    path: info.outputPath('overview.png'),
    fullPage: true,
  });
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Projects', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Create project', exact: true })
    .click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Project name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create project', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Create project', exact: true })
    .click();
  await dialog.getByLabel('Project name').fill('Workflow delivery');
  await dialog
    .getByLabel('Description')
    .fill('Ship the browser-tested workflow.');
  await dialog
    .getByRole('button', { name: 'Create project', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();
  await page.getByRole('button', { name: 'Create task', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Task title').fill('Verify deployment checklist');
  await dialog
    .getByLabel('Description')
    .fill('Check the complete browser workflow.');
  await dialog
    .getByRole('combobox', { name: 'Project', exact: true })
    .selectOption({ label: 'Workflow delivery' });
  await dialog
    .getByRole('combobox', { name: 'Assignee', exact: true })
    .selectOption(workspace.memberId);
  await dialog.getByLabel('Due date').fill('2026-10-26');
  await dialog
    .getByRole('combobox', { name: 'Priority', exact: true })
    .selectOption('HIGH');
  await dialog
    .getByRole('button', { name: 'Create task', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.getByLabel('Search tasks').fill('deployment checklist');
  await page
    .getByRole('combobox', { name: 'Priority', exact: true })
    .selectOption('HIGH');
  const row = page
    .getByRole('row')
    .filter({ hasText: 'Verify deployment checklist' });
  await expect(row).toBeVisible();
  await row
    .getByRole('button', { name: 'Edit Verify deployment checklist' })
    .click();
  await page
    .getByRole('dialog')
    .getByLabel('Task title')
    .fill('Verify release checklist');
  await page.getByRole('button', { name: 'Save task', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByLabel('Search tasks').fill('release checklist');
  await expect(
    page.getByRole('row').filter({ hasText: 'Verify release checklist' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('row').filter({ hasText: 'Verify release checklist' }),
  ).toBeVisible();
  await expectReadableContrast(page);
  await page.screenshot({ path: info.outputPath('tasks.png'), fullPage: true });
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Delete Workflow delivery', exact: true })
    .click();
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByRole('alert')).toContainText('related record');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page
    .getByRole('link', { name: 'Workflow delivery', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Delete Verify release checklist',
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Delete Workflow delivery', exact: true })
    .click();
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(
    page.getByRole('link', { name: 'Workflow delivery', exact: true }),
  ).toHaveCount(0);
});

test('Member changes only assigned status and reads their overdue notification', async ({
  page,
  workspace,
}, info) => {
  await login(page, workspace.memberEmail, workspace.password);
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Create task', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('combobox', { name: 'Assignee', exact: true })
    .selectOption(workspace.memberId);
  await expect(
    page.getByRole('row').filter({ hasText: workspace.ownTask }),
  ).toBeVisible();
  await expect(
    page.getByRole('row').filter({ hasText: workspace.otherTask }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  const ownStatus = page.getByLabel(`Status for ${workspace.ownTask}`, {
    exact: true,
  });
  await ownStatus.selectOption('IN_PROGRESS');
  await expect(ownStatus).toHaveValue('IN_PROGRESS');
  await expect(
    page.getByRole('row').filter({ hasText: workspace.otherTask }),
  ).toContainText('View only');
  await expect(
    page.getByLabel(`Status for ${workspace.otherTask}`, { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('navigation')
    .getByRole('link', { name: /Notifications/ })
    .click();
  await expect(
    page.getByRole('link', { name: workspace.ownTask, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: workspace.otherTask, exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', {
      name: `Mark ${workspace.ownTask} as read`,
      exact: true,
    })
    .click();
  await expect(page.getByText('0 unread', { exact: true })).toBeVisible();
  await expectReadableContrast(page);
  await page.screenshot({
    path: info.outputPath('notifications.png'),
    fullPage: true,
  });
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();
  await page
    .getByLabel(`Status for ${workspace.ownTask}`, { exact: true })
    .selectOption('COMPLETED');
  await expect(
    page.getByLabel(`Status for ${workspace.ownTask}`, { exact: true }),
  ).toHaveValue('COMPLETED');
  await page
    .getByRole('navigation')
    .getByRole('link', { name: /Notifications/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'You’re all caught up' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
  await page.goto('/projects');
  await expect(page).toHaveURL(/\/login$/);
});

test('Public registration validates input and creates a member account', async ({
  page,
  workspace,
}, info) => {
  await page.goto('/register');
  await expect(
    page.getByRole('heading', { name: 'Create your account' }),
  ).toBeVisible();
  await expectReadableContrast(page);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByLabel('Full name').fill('Browser New Member');
  await page.getByLabel('Email address').fill(workspace.registrationEmail);
  await page.getByLabel('Password', { exact: true }).fill(workspace.password);
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'You’re ready to join in.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Go to sign in' }).click();
  await login(page, workspace.registrationEmail, workspace.password);
  await expect(
    page.getByRole('button', { name: 'Create task', exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: info.outputPath('new-member.png'),
    fullPage: true,
  });
});
