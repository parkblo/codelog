# Style and Conventions

## Language
- TypeScript is used throughout the project. Use strict types where possible.

## Architecture
- Use entity-level separation by responsibility, not by caller type.
- `*.action.ts`: Server Action entrypoints (`"use server"`). Keep orchestration only (auth/session checks, input validation, cache revalidation, action-level error mapping).
- `*.service.ts`: Server-only business/data layer. Keep reusable domain logic and DB access here; avoid framework-specific orchestration.
- Query/read flows: Prefer calling service methods directly from Server Components (or other server code).
- Mutation/write flows: Prefer `action -> service` so client-triggered mutations use a stable server boundary.
- Keep actions thin; move reusable logic to services.

## Naming
- Services: `NameService`.
- Interfaces: `INameService`.
- Actions: `nameAction`.
- Components: PascalCase.

## Styling
- Use Tailwind CSS 4 utility classes.
- Prefer CSS variables for themes and common values.
