# Unify App

## Project Overview
Unify App — project initialized on 2026-02-23.

## Tech Stack
- *To be defined as the project evolves*

## Project Structure
```
unify-app/
├── CLAUDE.md          # Project conventions and best practices
├── .gitignore         # Git ignore rules
└── (more to come)
```

## Best Practices

### Code Quality
- Write clear, readable code — prefer clarity over cleverness
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names
- Avoid premature abstractions — wait until a pattern repeats before extracting

### Git Workflow
- Use descriptive commit messages that explain *why*, not just *what*
- Keep commits atomic — one logical change per commit
- Branch naming: `feature/`, `fix/`, `chore/` prefixes
- Always work on feature branches, merge to `main` via PR

### File Organization
- Group related files together by feature/domain
- Keep the root directory clean — config files only
- No large binary files in the repo

### Security
- Never commit secrets, API keys, or credentials
- Use `.env` files for local configuration (already in `.gitignore`)
- Validate all external input at system boundaries

### Documentation
- Keep this CLAUDE.md up to date as the project evolves
- Document architectural decisions when they're made
- Code should be self-documenting; add comments only for non-obvious logic

## Architecture Decisions
*Logged as they are made:*

| Date       | Decision | Rationale |
|------------|----------|-----------|
| 2026-02-23 | Project initialized | — |

## Common Commands
```bash
# (will be populated as tooling is added)
```
