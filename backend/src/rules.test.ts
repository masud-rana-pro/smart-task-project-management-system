import { describe, expect, it } from 'vitest';
import { bangladeshDate, isCalendarDate } from './dates.js';
import { taskPatch, taskStatusInput } from './validation.js';
import { hashPassword, verifyPassword } from './passwords.js';

describe('date and partial update rules', () => {
  it('uses the Bangladesh midnight boundary', () => {
    expect(bangladeshDate(new Date('2026-10-24T17:59:59.999Z'))).toBe(
      '2026-10-24',
    );
    expect(bangladeshDate(new Date('2026-10-24T18:00:00.000Z'))).toBe(
      '2026-10-25',
    );
  });
  it('validates actual calendar dates while allowing past deadlines', () => {
    expect(isCalendarDate('2024-02-29')).toBe(true);
    expect(isCalendarDate('2025-02-29')).toBe(false);
    expect(isCalendarDate('2026-04-31')).toBe(false);
    expect(isCalendarDate('2026-1-01')).toBe(false);
    expect(isCalendarDate('2020-01-01')).toBe(true);
  });
  it('does not silently reset omitted fields in a PATCH', () => {
    expect(taskPatch.parse({ title: 'Revised' })).toEqual({ title: 'Revised' });
    expect(taskStatusInput.safeParse({}).success).toBe(false);
    expect(
      taskStatusInput.safeParse({ status: 'TODO', priority: 'HIGH' }).success,
    ).toBe(false);
  });
});

it('uses different salts, checks passwords and handles invalid stored formats safely', async () => {
  const first = await hashPassword('A test password with spaces');
  const second = await hashPassword('A test password with spaces');
  expect(first).not.toBe(second);
  expect(await verifyPassword('A test password with spaces', first)).toBe(true);
  expect(await verifyPassword('An incorrect password', first)).toBe(false);
  expect(await verifyPassword('Any password', 'invalid-stored-format')).toBe(
    false,
  );
}, 30_000);
