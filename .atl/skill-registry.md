# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| PR, pull request | branch-pr | /home/kkaps/.claude/skills/branch-pr/SKILL.md |
| PRs over 400 lines, stacked PRs, review slices | chained-pr | /home/kkaps/.claude/skills/chained-pr/SKILL.md |
| PR feedback, issue replies, reviews, Slack messages, GitHub comments | comment-writer | /home/kkaps/.claude/skills/comment-writer/SKILL.md |
| writing guides, READMEs, RFCs, onboarding, architecture, review-facing docs | cognitive-doc-design | /home/kkaps/.claude/skills/cognitive-doc-design/SKILL.md |
| implementation, commit splitting, chained PRs, keeping tests and docs with code | work-unit-commits | /home/kkaps/.claude/skills/work-unit-commits/SKILL.md |
| Go tests, go test coverage | go-testing | /home/kkaps/.claude/skills/go-testing/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### branch-pr
- Create PRs with issue-first checks
- Include test results and coverage in PR description
- Use conventional commits format
- Reference related issues in PR body

### chained-pr
- Split oversized changes (>400 lines) into chained PRs
- Each PR should be independently reviewable
- Use stacking to maintain review focus
- Reference parent PR in child PR description

### comment-writer
- Write warm, direct collaboration comments
- Use neutral/professional register for technical content
- Be specific about what needs to change
- Include code examples when suggesting fixes

### cognitive-doc-design
- Design docs that reduce cognitive load
- Use clear headings and structure
- Include code examples for complex concepts
- Write for the reader's context level

### work-unit-commits
- Plan commits as reviewable work units
- Keep commits atomic and focused
- Include tests with code changes
- Use conventional commit messages

### go-testing
- Table-driven tests for multiple cases
- Test behavior and state transitions
- Use t.TempDir() for filesystem tests
- Keep integration tests skippable

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| PLAN.md | /home/kkaps/dev/diosesmon-crianza/PLAN.md | Master development plan with AI context block |
| vite.config.ts | /home/kkaps/dev/diosesmon-crianza/vite.config.ts | Vite config with Vitest test setup |
| tsconfig.app.json | /home/kkaps/dev/diosesmon-crianza/tsconfig.app.json | TypeScript config for app |
| package.json | /home/kkaps/dev/diosesmon-crianza/package.json | Project dependencies and scripts |
