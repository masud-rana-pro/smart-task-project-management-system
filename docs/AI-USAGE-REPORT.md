# AI Usage Report

Smart Task & Project Management System | 27 October 2026

## Tools and scope

I used OpenAI Codex throughout planning and development, including the React interface, Express API, PostgreSQL schema, tests, Docker setup and deployment configuration. Standard starter files came from official generators. Most application code and tests were generated or edited with Codex's assistance.

## Three actual prompts

These are shortened English paraphrases of my requests:

1. Read the assignment, plan an industry-style project, and implement required and optional features with GitHub and free no-card hosting.
2. Ask unresolved decisions as a multiple-choice interview and obtain milestone/setup confirmations.
3. Check separation of concerns and all requirements; correct gaps before preparing the final submission documents.

## Problem solved with AI assistance

One useful example was the member permission rule: members can see shared work but can update only the status of their assigned tasks. Codex helped implement backend role checks and an atomic database update. API and browser tests checked that members could not edit other fields or update another person's task.

## An incomplete suggestion and its correction

The first AI-assisted deployment configuration used npm ci under production NODE_ENV. That left out development dependencies needed to build the application. The install command was corrected to npm ci --include=dev, and CI was updated to check the same environment. This kept production runtime settings while making the build reproducible.

## Verification and candidate contribution

Verification included formatting, lint, TypeScript checks, 43 automated tests, both application builds and ten desktop/mobile browser workflows. Integration tests used a real isolated PostgreSQL database. Container checks covered migrations and repeatable sample data; live checks covered authentication, permissions, persistence and the final Tasks interface. GitHub CI passed for the submitted application revision.

My contributions included choosing PostgreSQL, deciding permissions and deadline behavior, reviewing milestones, setting up local databases and hosting accounts, entering credentials privately and performing the initial deployment steps. I manually tested the application, including mobile use, and requested the final architecture and requirements review. Codex generated or edited the implementation and tests and ran the recorded automated checks. Detailed evidence is available in docs/AI-WORK-LOG.md and docs/FINAL-VERIFICATION.md.
