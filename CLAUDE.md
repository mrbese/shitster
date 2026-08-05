# Project guidance

Read `specs/SPEC-SHARED.md` before changing product behavior or legal copy. Its FACTS section governs every DashOff module.

## Testing

Run `npm test` and `npm run build` before committing. See `TESTING.md` for the test layers and conventions.

When adding a conditional, test both paths. When fixing a behavior bug, add a regression test. Do not commit changes that break existing tests.
