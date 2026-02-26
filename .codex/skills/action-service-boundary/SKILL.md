---
name: action-service-boundary
description: Provide governance context for defining and maintaining boundaries between `*.action.ts` and `*.service.ts` in Next.js App Router entity APIs. Use when handling entity API layer functions or Server Action/Service methods, and when creating/refining conventions, refactor plans, or review criteria in `src/**/api`.
---

# Action Service Boundary Governance

## Trigger Scope
- Apply when a task handles entity API layer functions.
- Apply when a task handles Server Action/Service methods (`*.action.ts`, `*.service.ts`).
- Apply when a task creates or updates team conventions, refactor plans, or review criteria for `src/**/api`.

## Goal
- Keep boundaries explicit so API-layer functions remain predictable, reusable, and reviewable.
- Separate framework orchestration concerns from reusable domain/data logic.

## Boundary Contract
1. Action contract (`*.action.ts`)
- Keep `"use server"` entrypoints for orchestration.
- Handle auth/session checks, input validation, cache invalidation, and action-level error mapping.
- Delegate reusable business/data logic to services.

2. Service contract (`*.service.ts`)
- Keep server-only reusable domain logic and database adapter access.
- Avoid framework orchestration concerns such as revalidation or navigation flow control.
- Expose methods reusable from Server Components, Route Handlers, and Actions.

3. Query/mutation contract
- Query/read flows: prefer direct service calls from server code when action boundary is unnecessary.
- Client-triggered mutation flows: prefer `action -> service`.

## Management Workflow
1. Classify each function as orchestration, domain logic, or data access.
2. Move mixed concerns to respect the boundary contract.
3. Preserve external API signatures while refactoring file placement.
4. Update imports and public entrypoints consistently.
5. Record architectural decisions in project docs when conventions change.

## Review Criteria
- Does action code contain only orchestration concerns?
- Does service code stay free of framework orchestration concerns?
- Are query and mutation flows placed according to the contract?
- Are client imports prevented from reaching service modules directly?
- Were AGENTS/memory docs updated when convention-level changes were introduced?
