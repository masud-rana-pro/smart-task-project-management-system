const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const text = { type: 'string' };
const id = { type: 'string', format: 'uuid' };
const status = { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] };
const priority = { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] };
const object = (
  properties: Record<string, unknown>,
  required: string[] = [],
) => ({ type: 'object', additionalProperties: false, properties, required });
const json = (schema: unknown) => ({ 'application/json': { schema } });
const body = (schema: unknown) => ({ required: true, content: json(schema) });
const taskFields = {
  title: { ...text, minLength: 1, maxLength: 200 },
  description: { ...text, maxLength: 8000 },
  projectId: id,
  assigneeId: id,
  status,
  priority,
  dueDate: {
    ...text,
    format: 'date',
    description:
      'Calendar date, due through end of day in Asia/Dhaka. Past deadlines are valid.',
  },
};
const projectFields = {
  name: { ...text, minLength: 1, maxLength: 160 },
  description: { ...text, minLength: 1, maxLength: 4000 },
};
const idParameter = { name: 'id', in: 'path', required: true, schema: id };
const originParameter = {
  name: 'Origin',
  in: 'header',
  required: true,
  schema: { type: 'string', format: 'uri' },
  description:
    'Must match APP_ORIGIN. Browsers supply this header automatically.',
};
const paths: Record<string, Record<string, unknown>> = {};
function operation(
  path: string,
  method: string,
  summary: string,
  schema: unknown,
  options: {
    input?: unknown;
    public?: boolean;
    created?: boolean;
    empty?: boolean;
    parameters?: unknown[];
  } = {},
) {
  const write = !['get', 'head'].includes(method);
  paths[path] ??= {};
  paths[path][method] = {
    summary,
    security: options.public
      ? []
      : [{ cookieAuth: [], ...(write ? { csrfToken: [] } : {}) }],
    parameters: [
      ...(path.includes('{id}') ? [idParameter] : []),
      ...(write ? [originParameter] : []),
      ...(options.parameters ?? []),
    ],
    ...(options.input ? { requestBody: body(options.input) } : {}),
    responses: {
      [options.empty ? '204' : options.created ? '201' : '200']: {
        description: 'Success',
        ...(options.empty ? {} : { content: json(schema) }),
      },
      ...Object.fromEntries(
        [400, 401, 403, 404, 409, 413, 429, 500].map((code) => [
          String(code),
          {
            description: (
              {
                400: 'Invalid request',
                401: 'Authentication required',
                403: 'Forbidden or invalid CSRF/origin',
                404: 'Not found',
                409: 'Conflict or related record',
                413: 'Request too large',
                429: 'Rate limited; Retry-After in seconds',
                500: 'Unexpected error',
              } as Record<number, string>
            )[code],
            content: json(ref('Error')),
          },
        ]),
      ),
    },
  };
}
paths['/api/ready'] = {
  get: {
    summary: 'Database readiness check',
    security: [],
    responses: {
      '200': {
        description: 'Database reachable',
        content: json(object({ status: { const: 'ready' } }, ['status'])),
      },
      '503': {
        description: 'Database unavailable',
        content: json(object({ status: { const: 'unavailable' } }, ['status'])),
      },
    },
  },
};
operation(
  '/api/health',
  'get',
  'API liveness; does not assert database readiness',
  object({ status: { const: 'ok' } }, ['status']),
  { public: true },
);
operation(
  '/api/auth/csrf',
  'get',
  'Get an anonymous session and its CSRF token before login/registration',
  object({ csrfToken: text }, ['csrfToken']),
  { public: true },
);
operation(
  '/api/auth/register',
  'post',
  'Register a Team Member; does not automatically log in',
  object({ user: ref('User') }, ['user']),
  {
    created: true,
    input: object(
      {
        name: { ...text, minLength: 1, maxLength: 120 },
        email: { ...text, format: 'email' },
        password: { ...text, minLength: 12, maxLength: 128, writeOnly: true },
      },
      ['name', 'email', 'password'],
    ),
  },
);
operation(
  '/api/auth/login',
  'post',
  'Log in; regenerates session and returns a new CSRF token',
  object({ user: ref('User'), csrfToken: text }, ['user', 'csrfToken']),
  {
    input: object(
      {
        email: { ...text, format: 'email' },
        password: { ...text, minLength: 1, maxLength: 128, writeOnly: true },
      },
      ['email', 'password'],
    ),
  },
);
operation(
  '/api/auth/me',
  'get',
  'Get current identity',
  object({ user: ref('User') }, ['user']),
);
operation(
  '/api/auth/members',
  'get',
  'Admin: list members for password reset',
  object({
    users: {
      type: 'array',
      items: object({ id, name: text, email: { ...text, format: 'email' } }, [
        'id',
        'name',
        'email',
      ]),
    },
  }),
);
operation(
  '/api/auth/members/{id}/reset-password',
  'post',
  'Admin: reset a Team Member password and revoke their sessions',
  {},
  {
    empty: true,
    input: object(
      { password: { ...text, minLength: 12, maxLength: 128, writeOnly: true } },
      ['password'],
    ),
  },
);
operation(
  '/api/auth/logout',
  'post',
  'Destroy the stored session and clear its cookie',
  {},
  { empty: true },
);
operation(
  '/api/users/assignees',
  'get',
  'List minimal assignee identities for shared-workspace filtering',
  object({
    users: { type: 'array', items: object({ id, name: text }, ['id', 'name']) },
  }),
);
operation(
  '/api/projects',
  'get',
  'List all shared-workspace projects',
  object({ projects: { type: 'array', items: ref('Project') } }),
);
operation(
  '/api/projects',
  'post',
  'Admin: create a project',
  object({ project: ref('Project') }),
  { created: true, input: object(projectFields, ['name', 'description']) },
);
operation(
  '/api/projects/{id}',
  'get',
  'Get project',
  object({ project: ref('Project') }),
);
operation(
  '/api/projects/{id}',
  'patch',
  'Admin: update supplied project fields',
  object({ project: ref('Project') }),
  { input: { ...object(projectFields), minProperties: 1 } },
);
operation(
  '/api/projects/{id}',
  'put',
  'Admin: replace editable project fields',
  object({ project: ref('Project') }),
  { input: object(projectFields, ['name', 'description']) },
);
operation(
  '/api/projects/{id}',
  'delete',
  'Admin: delete an empty project; returns 409 if tasks remain',
  {},
  { empty: true },
);
operation(
  '/api/tasks',
  'get',
  'List tasks with combined filters, search and pagination',
  object({
    tasks: { type: 'array', items: ref('Task') },
    pagination: ref('Pagination'),
  }),
  {
    parameters: Object.entries({
      projectId: id,
      assigneeId: id,
      status,
      priority,
      search: { ...text, maxLength: 200 },
      page: { type: 'integer', minimum: 1, maximum: 100000, default: 1 },
      pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      sortBy: {
        type: 'string',
        enum: ['createdAt', 'updatedAt', 'dueDate', 'title', 'priority'],
        default: 'createdAt',
      },
      sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    }).map(([name, schema]) => ({ name, in: 'query', schema })),
  },
);
operation(
  '/api/tasks',
  'post',
  'Admin: create task (defaults TODO/MEDIUM)',
  object({ task: ref('Task') }),
  {
    created: true,
    input: object(taskFields, ['title', 'projectId', 'assigneeId', 'dueDate']),
  },
);
operation('/api/tasks/{id}', 'get', 'Get task', object({ task: ref('Task') }));
operation(
  '/api/tasks/{id}',
  'patch',
  'Admin: update supplied task fields without resetting omissions',
  object({ task: ref('Task') }),
  { input: { ...object(taskFields), minProperties: 1 } },
);
operation(
  '/api/tasks/{id}',
  'put',
  'Admin: replace editable task fields',
  object({ task: ref('Task') }),
  {
    input: object(taskFields, ['title', 'projectId', 'assigneeId', 'dueDate']),
  },
);
operation(
  '/api/tasks/{id}',
  'delete',
  'Admin: delete task and associated notifications',
  {},
  { empty: true },
);
operation(
  '/api/tasks/{id}/status',
  'patch',
  'Admin or assigned member: change status only',
  object({ task: ref('Task') }),
  { input: object({ status }, ['status']) },
);
operation(
  '/api/dashboard',
  'get',
  'Shared totals and project progress; pending includes TODO/IN_PROGRESS; completed tasks are not overdue',
  ref('Dashboard'),
);
operation(
  '/api/notifications',
  'get',
  'Synchronize and list up to 50 current overdue notices; unreadCount covers all current notices',
  object({
    notifications: { type: 'array', items: ref('Notification') },
    unreadCount: { type: 'integer' },
  }),
);
operation(
  '/api/notifications/{id}/read',
  'patch',
  'Mark own notification read; another user receives 404',
  {},
  { empty: true },
);

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Smart Task REST API',
    version: '0.2.0',
    description:
      'Cookie sessions expire after eight hours. Fetch /api/auth/csrf first, retain the cookie, send X-CSRF-Token plus matching Origin on every mutation. Login rotates both session and CSRF token. Admin creation is a local CLI operation. Authentication endpoints are throttled in PostgreSQL. No production credentials or sample passwords are included.',
  },
  servers: [
    {
      url: '/',
      description: 'Same-origin frontend proxy or direct API server',
    },
  ],
  paths,
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'smart_task.sid',
        description:
          'Cookie from CSRF bootstrap/login, HttpOnly, SameSite=Lax and Secure in production.',
      },
      csrfToken: { type: 'apiKey', in: 'header', name: 'X-CSRF-Token' },
    },
    schemas: {
      User: object(
        {
          id,
          name: text,
          email: { ...text, format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'TEAM_MEMBER'] },
        },
        ['id', 'name', 'email', 'role'],
      ),
      Project: {
        type: 'object',
        properties: {
          id,
          ...projectFields,
          createdById: id,
          createdAt: { ...text, format: 'date-time' },
          updatedAt: { ...text, format: 'date-time' },
          _count: object({ tasks: { type: 'integer' } }),
        },
      },
      Task: {
        type: 'object',
        properties: {
          id,
          ...taskFields,
          createdById: id,
          createdAt: { ...text, format: 'date-time' },
          updatedAt: { ...text, format: 'date-time' },
          assignee: object({ id, name: text }),
          project: object({ id, name: text }),
        },
      },
      Pagination: object({
        page: { type: 'integer' },
        pageSize: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' },
      }),
      Notification: object({
        id,
        taskId: id,
        title: text,
        dueDate: { ...text, format: 'date' },
        readAt: { type: ['string', 'null'], format: 'date-time' },
        createdAt: { ...text, format: 'date-time' },
      }),
      Dashboard: object({
        totalProjects: { type: 'integer' },
        totalTasks: { type: 'integer' },
        completedTasks: { type: 'integer' },
        pendingTasks: { type: 'integer' },
        overdueTasks: { type: 'integer' },
        projects: {
          type: 'array',
          items: object({
            id,
            name: text,
            totalTasks: { type: 'integer' },
            completedTasks: { type: 'integer' },
            progress: { type: 'integer', minimum: 0, maximum: 100 },
          }),
        },
      }),
      Error: object(
        {
          error: object(
            {
              code: text,
              message: text,
              fields: {
                type: 'array',
                items: object({ field: text, message: text }),
              },
            },
            ['code', 'message'],
          ),
        },
        ['error'],
      ),
    },
  },
};
