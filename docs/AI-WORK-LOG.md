# AI assistance work log

This is a factual working log, not the final one-page report. The final report must describe completed work and verification. Do not invent candidate implementation work or incorrect suggestions to meet the assignment format.

## Tool and contributions

OpenAI Codex read the assignment, extracted requirements, conducted multiple-choice planning interviews, drafted architecture/acceptance documents and integrated the M1 scaffolding, schema and initial tests. Vite/npm/TypeScript/Prisma CLIs generate the standard skeleton where applicable. The candidate selected PostgreSQL, TypeScript approval, permissions, notification behavior, date semantics, public repository naming, and approval gates. These decisions are candidate contributions; do not claim the candidate manually wrote AI-generated files.

## Actual prompt excerpts for the final report

1. "Before doing development i want to plan appropriately as industrial way" - requested planning, prerequisites, GitHub/free hosting and confirmation gates.
2. "ask me these quiations as interview in multiple choice questions" - established the decision interview workflow.
3. "reduse the project skeliton creation by command" - requested official scaffolding commands rather than manually creating every starter file.

Preserve these as excerpts and replace/add implementation prompts later if more useful for the final report.

## Actual issues and corrections

- Initial npm command combined a text package name with `--json`, causing a JSON parse error. Split text and boolean configuration into separate npm commands and verified generated manifests. No claim that a failed command succeeded.
- npm's default Prisma tag resolved to an 8.0 release candidate. Selected the stable 7.x major and matching client/adapter instead. Verify the final installed versions from the lockfile.
- Patch integration attempted delete/add operations on the same file; the patch tool rejected that format. Switched to a batch project-configuration script for the generator outputs. File access under the sandbox also required authorized execution outside it.
- PostgreSQL startup attempts were denied by Windows. Kept API liveness separate from database readiness so the application cannot falsely claim database success.

## Verification

Initial results: formatting, ESLint, TypeScript checks, both production builds, two frontend tests and five backend tests passed. One real-database test skipped because no TEST_DATABASE_URL was configured. Prisma 7.10.1 validated the schema and generated the client. SQL was generated with migrate diff and reviewed for constraints; it has not yet been applied locally. A full clean npm ci passed; the final check pipeline passed again. Two Playwright browser tests passed using installed Chrome on desktop/mobile profiles, and screenshots were visually reviewed. The dedicated Chromium download failed with network resets/DNS errors, so it was not used. AI-generated code remains subject to review and tests. Candidate learning checkpoints: explain app versus server separation, Vite's /api proxy, npm workspaces, schema/migrations, and why liveness is not database readiness.

The latest form resolver (6.x) produced a real optional-peer conflict between Effect versions. Corrected by selecting compatible @hookform/resolvers 5.9.2; installed dependency tree is valid without --force or --legacy-peer-deps. npm audit reported zero known vulnerabilities at installation time; this does not prove the application is secure.

Prisma init attempted an additional automatic skills step. Stopped that step, retained only the project database starter, explicitly selected prisma.config.ts in commands, and excluded empty tool-specific agent directories. No global agent settings were changed.
