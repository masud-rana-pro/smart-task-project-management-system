# M4 hardening and containers proposal

Status: awaiting approval. No container download, service start or deployment is authorized by this document.

## Proposed scope

Review the implemented browser/API permission and session boundaries, error/retry behavior, validation, accessibility (labels/focus/contrast) and responsive layouts. Address findings and add tests only where they protect meaningful behavior. Verify migration and guarded seed reproduction on a new isolated disposable target without resetting the candidate's development/test databases.

Add reviewed frontend/API Dockerfiles, .dockerignore files and Docker Compose configuration for PostgreSQL, migrations and the application. Keep local secrets outside images and Git; use health checks, bounded connections and documented startup/shutdown instructions. Run the container workflow and the full code/browser checks, recording actual evidence and remaining limits.

## Separate setup approvals

Read-only Docker inspection on 25 October found the Docker Desktop Linux engine unavailable. Running containers requires starting Docker Desktop and may require local Windows/WSL setup; request separate approval before such changes. Downloading required base images is also a separate approval. Stop and explain any required administrator action or restart.

No paid services, hosting setup or public publishing is included. M5 free/no-card account and deployment setup remains a later approval.
