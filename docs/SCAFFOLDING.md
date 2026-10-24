# Command-generated foundation

The candidate requested CLI scaffolding to reduce manual skeleton creation. M1 uses the official generator output, then adapts only project-specific configuration and code.

Commands actually used, with notes:

```sh
npm create vite@latest frontend -- --template react-ts --no-interactive
npm init -y
npm pkg set 'workspaces[0]=frontend' 'workspaces[1]=backend'
npm init -y -w backend
```

The Vite generator version was 9.3.1. Its template supplied React, TypeScript, Vite configuration, HTML, entry point and standard files. npm generated workspace manifests. Project-specific Express scaffolding uses npm dependencies directly: Express's generic generator targets server-rendered applications, so it would add irrelevant view/template code to this REST API.

Installed the approved libraries using workspace-aware `npm install -w frontend ...`, `npm install -w backend ...`, and dev-dependency installs. The lockfile records exact resolved versions. Stable Prisma 7.10.1 was selected explicitly, since the registry default resolved to a release candidate. No global tools were installed.

From backend/, the official Prisma starter command was:

```sh
../node_modules/.bin/prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

On Windows the `.cmd` launchers and backslashes were used. The CLI generated its bare schema, then attempted an additional skills installation step, which was interrupted. The starter was adapted in a temporary batch script; redundant generated config and unused Vite demo assets were removed. Temporary scripts were removed after setup to prevent accidentally overwriting future feature work.

TypeScript `tsc --init` was attempted after project-specific compiler configuration existed and correctly refused to overwrite it. The final backend configuration is deliberately customized for strict Node ESM compilation rather than claiming that this command created it.

The schema was formatted and SQL generated without a database connection:

```sh
prisma format --schema backend/prisma/schema.prisma --config backend/prisma.config.ts
prisma migrate diff --from-empty --to-schema backend/prisma/schema.prisma --script --config backend/prisma.config.ts --output backend/prisma/migrations/20261024000100_initial/migration.sql
```

After cloning, use `npm ci`, not these initial scaffolding commands. Regenerating starters inside a developed project could overwrite application work.
