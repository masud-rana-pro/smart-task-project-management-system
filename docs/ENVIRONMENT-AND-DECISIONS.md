# Environment, hosting and open decisions

Read-only inspection: 24 October 2026. No installation, service start, Git initialization, account connection, or publication performed.

## Installed tools

| Tool                 | Observation                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Node.js              | v24.16.0                                                                                            |
| npm                  | 11.13.0                                                                                             |
| Git                  | 2.53.0.windows.2                                                                                    |
| PostgreSQL client    | 17.10                                                                                               |
| PostgreSQL service   | postgresql-x64-17 exists and is stopped; localhost default port check returned no response          |
| Docker CLI           | 29.5.2                                                                                              |
| Docker Compose       | v5.1.4                                                                                              |
| Docker engine        | Unreachable named pipe during inspection; com.docker.service stopped. Docker readiness not verified |
| Docker configuration | Inspection reported access denied to user Docker config; do not infer config contents               |
| GitHub CLI           | Not on PATH                                                                                         |
| Editor command       | Resolves to Cursor's code command                                                                   |
| Repository           | Folder initially empty; not initialized as a Git repository                                         |

No database credentials inspected. PostgreSQL client presence does not establish working database access. No existing database should be modified; propose an isolated project database after approval.

## Hosting research: proposals, not approved providers

- Neon Free PostgreSQL: official pricing advertises no credit card and no time limit, subject to resource quotas. Check account eligibility, current limits, pooling and region during setup. Source: https://neon.com/pricing
- Render Free web service: straightforward Node/Express hosting. Sleeps after 15 minutes idle; restart can take about a minute. Free services have quotas. Render's own free Postgres expires after 30 days, so propose Neon instead. Source: https://render.com/docs/free
- Render no-card caveat: staff states some accounts may be asked for card details for verification. Therefore Render cannot be guaranteed to satisfy this user's no-card requirement. Source: https://community.render.com/t/the-deployement-of-a-web-service-fails/36005
- Vercel Hobby alternative: free personal/non-commercial tier; Express is supported as a Vercel Function. A recruitment demo is proposed as a personal assessment project, not an operational company deployment. Verify eligibility and no-card signup before choosing. Stateless execution requires persistent sessions/notifications in PostgreSQL and no reliance on in-process scheduled jobs. Sources: https://vercel.com/docs/plans/hobby and https://vercel.com/docs/frameworks/backend/express

Recommendation to discuss: Vercel for React and Express with Neon PostgreSQL, subject to approval and a no-card account check. Alternative: Render plus Neon if no-card onboarding succeeds. Free tiers have quotas and cannot promise production availability. Keep the local/container run path reproducible.

## Language recommendation

Use TypeScript in frontend and backend for static checks, refactoring and editor feedback, while keeping runtime request validation. This is an engineering recommendation, not a claim that every company uses the same stack. Source: https://www.typescriptlang.org/docs/handbook/2/basic-types.html

## Agent tooling proposal

- Recommend a root AGENTS.md with the already-agreed milestone approvals, installation/publishing gates, project commands, verification rules, and learning/documentation expectations. Do not change global agent settings. Draft this after approval of the instruction content. Official guidance: https://developers.openai.com/codex/guides/agents-md
- GitHub plugin discovery found an available but uninstalled GitHub integration. It could help inspect repositories, pull requests and CI; user approval/connection is still needed. Git itself is installed. GitHub CLI is an alternative optional installation, not a prerequisite for writing code.
- Existing shell, file and browser capabilities cover much of the development workflow. Do not install unrelated plugins or create new agent chats without authorization.

## Next approvals

Update after M1 authorization: TypeScript, listed libraries/architecture, public repository name smart-task-project-management-system, permission/date/deletion/notification rules, search/pagination/sorting, project AGENTS.md, M1 implementation, local dependency installation, local Git initialization/foundation commit and Chromium download are approved. PostgreSQL now runs and accepts connections. The candidate approved smart_task plus smart_task_dev/smart_task_test and is being guided through entering credentials locally. Database authentication and migration execution remain unverified. GitHub integration connection and publication remain unverified/unapproved respectively. The text below records the earlier planning checkpoint, not current approval status.

TypeScript and detailed library choices; hosting approach; GitHub name/visibility and authentication method; permission matrix; deadline/deletion/notification rules; isolated database approach; project agent instructions; implementation milestone M1. Starting services and installing packages must be explained before the relevant approval.
