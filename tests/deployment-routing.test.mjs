import { test } from 'node:test';
import assert from 'node:assert/strict';
import { removeRoutingMetadata } from '../deployment/routing.mjs';

test('removes platform metadata while preserving combined filters and pagination', () => {
  const request = {
    url: '/api/tasks?path=tasks&search=release%20notes&status=TODO&page=2',
    query: {
      path: 'tasks',
      search: 'release notes',
      status: 'TODO',
      page: '2',
    },
  };
  removeRoutingMetadata(request);
  const url = new URL(request.url, 'https://deployment.invalid');
  assert.equal(url.pathname, '/api/tasks');
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    search: 'release notes',
    status: 'TODO',
    page: '2',
  });
  assert.deepEqual(request.query, {
    search: 'release notes',
    status: 'TODO',
    page: '2',
  });
});

test('retains unknown application fields for strict backend rejection', () => {
  const request = {
    url: '/api/tasks?unexpected=value',
    query: { unexpected: 'value' },
  };
  removeRoutingMetadata(request);
  assert.equal(request.query.unexpected, 'value');
  assert.equal(request.url, '/api/tasks?unexpected=value');
});
