# Contributing to Comply AI

Thank you for your interest in contributing to Comply AI. This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/comply-ai.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install all workspace dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Type-check
npm run typecheck
```

## Project Structure

```
comply-ai/
  packages/
    core/     — Risk classification engine, types, model cards (MIT)
    cli/      — CLI tool (MIT)
    ci/       — CI/CD templates (MIT)
    web/      — Dashboard & API (BSL 1.1)
```

## Pull Request Process

1. Ensure your code passes `npm run typecheck` and `npm run test`
2. Update documentation if you change public APIs
3. Add tests for new functionality
4. Keep PRs focused — one feature or fix per PR
5. Write clear commit messages

## Code Style

- TypeScript strict mode
- ESM modules (`"type": "module"`)
- Use Zod for runtime validation
- Prefer explicit types over `any`

## Commit Messages

Follow conventional commits:

```
feat: add risk classification for GPAI models
fix: correct Article 6 reference in checklist
docs: update CLI usage examples
test: add integration tests for model card validation
```

## Reporting Issues

- Use GitHub Issues
- Include reproduction steps
- Include your Node.js version and OS

## License

By contributing to Comply AI, you agree that your contributions will be licensed under the same license as the module you are contributing to (MIT for core/cli/ci, BSL 1.1 for web).

## Contact

Questions? Email info@afkzonagroup.lt
