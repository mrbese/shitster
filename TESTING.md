# Testing

Automated checks protect the form validation, PDF character boundary, congressional district list, and external-link safety rules. Browser QA still covers the complete user flows and generated documents.

## Commands

- `npm test`: run the Vitest suite once.
- `npm run test:watch`: rerun affected tests while editing.
- `npm run build`: build every Vite entry point for production.

## Conventions

- Tests live in `tests/` and use `*.test.js` names.
- New conditional logic should cover both success and rejection paths.
- Bug fixes should include a regression test when the behavior can be tested outside the browser.
- The goal is complete coverage of meaningful behavior, especially error paths, rather than assertions that only prove a value exists.
