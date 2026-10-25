# Project agent instructions

Activated with user approval on 24 October 2026. Do not modify global Codex settings.

## Project and authority

Build the Bright Mind Smart Task & Project Management System with React/TypeScript, Node/Express/TypeScript and PostgreSQL. Use docs/REQUIREMENTS.md as the acceptance checklist and docs/PROJECT-PLAN.md for approved scope and milestones. Distinguish assignment content from user authorization. Keep the confidential PDF/email out of the public repository.

## Approval workflow

- Ask for milestone approval through a concise description of changes, verification and expected outputs; wait before implementing that milestone.
- Request separate approval for installations/downloads, starting or configuring services, GitHub repository creation/commits/pushes and external publishing/account actions. A concrete approved scope does not require repeated permission for every file edit inside it.
- Planning documents and read-only inspection/research are authorized. Do not treat planning approval as code implementation approval.
- Use multiple-choice interviews for unresolved product/architecture decisions. Explain recommendations and record answers. Do not repeatedly ask questions already resolved.
- No paid plans or payment cards. If a provider asks for a card, stop that setup path and present a compliant alternative.
- Never send the recruitment submission or messages to other people without explicit authorization.
- Do not spawn subagents unless explicitly authorized by the user.

## Engineering and learning

- Keep frontend/ and backend/ separate in one repository. Prefer small cohesive modules and explainable solutions.
- Enforce permissions and validation in backend code. Never trust browser role flags or accept Admin through public registration.
- Use reviewed migrations, isolated development/test databases, and fictional data. Do not reset or delete existing databases without explicit approval.
- Track actual AI prompts, corrections, verification, challenges and candidate contributions as they occur; never invent report entries.
- Explain key decisions in plain language using Java comparisons when useful. Include learning checkpoints before milestone signoff.
- Keep all project documents and deliverables inside this project folder. Never commit secrets, local environment files, generated dependency folders, or confidential recruitment material.

## Verification and reporting

- Select meaningful tests appropriate to the change; include real PostgreSQL API tests for persistence, permissions and sessions, plus core browser workflows.
- Record actual commands/results and unresolved limitations. Never mark acceptance criteria complete based on code presence alone.
- Require lint, type checks, tests, builds, clean migration/seed reproduction, and deployment smoke checks before final delivery.
- Use genuine incremental Git history after approval. Do not fabricate commits, dates, authorship or test evidence.
- Report what changed, what was verified and the next approval needed. Preserve the 26 October 2026 completion target in Asia/Dhaka; exact time is unconfirmed.

## Commands

- Install from the committed lockfile: `npm ci` (downloads require the user's installation approval).
- Run frontend and API locally: `npm run dev` (starting processes requires approval).
- Full code checks: `npm run check`.
- Validate schema/generate client: `npm run db:validate` and `npm run db:generate`.
- Apply existing migrations to an approved isolated target: `npm run db:deploy`.
- Author a development migration: `npm run db:migrate`; never reset valuable databases.
- Browser workflow: `npm run test:e2e`; browser binary download is separately approved for M1.
- Bootstrap Admin: `npm run admin:create` with locally supplied ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD. Do not expose those credentials.
- Guarded non-destructive local demo seed: `npm run db:seed` with an approved isolated target and explicit ALLOW_DEMO_SEED=true. Never enable this in production or reset existing data.
