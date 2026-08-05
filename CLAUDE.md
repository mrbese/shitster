# Project guidance

Read `specs/SPEC-SHARED.md` before changing product behavior or legal copy. Its FACTS section governs every DashOff module.

## Testing

Run `npm test` and `npm run build` before committing. See `TESTING.md` for the test layers and conventions.

When adding a conditional, test both paths. When fixing a behavior bug, add a regression test. Do not commit changes that break existing tests.

## Deploy Configuration

- Platform: Cloudflare Pages, deployed through GitHub Actions
- Production URL: https://dashoff.org
- Umbrella URL: https://shitster.org
- Deploy workflow: `.github/workflows/ci.yml`, job `deploy-pages`
- Deploy trigger: push to `main`, after `test-and-build` succeeds
- Staging: none
- Custom deploy hooks: none

The workflow rebuilds the merged commit and records its GitHub SHA on both the `dashoff` and `shitster` Pages deployments. The `dashoff-counter` Worker is deployed separately and must not be changed by a Pages-only release.
