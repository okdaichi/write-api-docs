# Changelog

All notable changes to this convention will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
uses semantic versioning while the convention is versioned.

## [Unreleased]

### Added

- Optional Deno TypeScript generator for creating starter API tests from API.md.
- Inline API.md examples for generated path parameters and request bodies.
- Optional example values file for projects that prefer external test data.
- Deno task and tests for the generator.

### Changed

- CI now runs Deno formatting, linting, and tests.

### Removed

## [v0.1.0] - 2026-05-01

### Added

- Initial API.md convention draft.
- Canonical API.md example with general item endpoints.
- README explaining the problem, solution, philosophy, use cases, non-goals, and project status.
- Contribution guidelines and lightweight governance.
- MIT license and code of conduct.
- Lightweight GitHub Actions for CI, Markdown linting, link checking, and GitHub Pages publishing.
