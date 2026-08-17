---
name: issue-review
description: Verify GitHub issues against shipped code and sync tracker state — check acceptance criteria, post a verification comment, close completed tickets, or report gaps and next steps. On a feature branch, offers to run /ship-pr first. Use when the user runs /issue-review with ticket numbers, or asks to verify, close, or sync GitHub issues.
disable-model-invocation: true
---

# Issue Review

Close the loop after **`/implement`** → **`/code-review`** → commit. This skill checks whether specified GitHub issues are **done in the codebase**, syncs GitHub, and — when you're not on `main` — can ship the branch first.

`/code-review` judges a **diff** (Standards + Spec). **`/issue-review`** judges **issue completion** and **writes to GitHub** (comment, close, labels).

If `docs/agents/issue-tracker.md` is missing, tell the user to run `/setup-matt-pocock-skills`.

## When to run

After implementation is committed and reviewed. Typical flow:

```
/implement → /code-review → commit → /issue-review
                                         ↓ (not on main?)
                                    offer /ship-pr
                                         ↓
                              verify on main → close issues
```

Do **not** run instead of `/code-review`.

## Process

### 0. Detect branch — offer to ship

```bash
git branch --show-current
git merge-base --is-ancestor HEAD main && echo on-main || echo feature-branch
```

**If current branch is `main` (or `master`):** skip to step 1; verification base is `main`.

**If on a feature branch:** use **AskQuestion** (or ask in chat if unavailable):

> You're on `<branch>`, not `main`. Create a PR, merge to `main`, and delete the branch before verifying issues?

Options:

1. **Yes, ship to main** (recommended) — run **`/ship-pr`** (read `.agents/skills/ship-pr/SKILL.md` and execute it). Unless `--dry-run`, perform the full ship. On success, continue on `main`. On failure, stop and report.
2. **No, stay on this branch** — verify against **current branch** only. Post issue comments with base `` `<branch>` ``. **Do not close** issues (work is not on `main` yet). Report what's left to merge manually.

If the user already said “merge” / “create PR” in the same prompt, treat that as **Yes** and skip the question.

### 1. Collect issue numbers

1. Arguments (`/issue-review 4 6 7`, `#4`, …).
2. Else open PR for current branch: `gh pr view --json body,closingIssuesReferences`.
3. Else `git log main..HEAD --oneline` — parse `#N` in subjects.

If still empty, ask: “Which issue numbers should I verify?”

Deduplicate. Fetch each with `gh issue view <n>`.

### 2. Pin the verification base

| Situation                                         | Verification base               |
| ------------------------------------------------- | ------------------------------- |
| On `main` after ship or already on `main`         | `main` @ `HEAD`                 |
| User declined ship                                | current feature branch @ `HEAD` |
| `--dry-run` on feature branch, user declined ship | current branch (report only)    |

Record implementing commits: `git log main..HEAD --oneline` when base is not `main`, or “already on main” when empty.

### 3. Fetch each issue spec

For every issue: `gh issue view <n> --comments`.

Extract title, state, labels, parent epic, **acceptance criteria** (checkboxes, “Acceptance criteria”, or “What to build”).

### 4. Verify each criterion (evidence required)

Check AC against the **verification base** codebase:

| Evidence type | How                                                                  |
| ------------- | -------------------------------------------------------------------- |
| API / backend | Routes, Prisma, migration, seed, tests                               |
| Frontend SSR  | Composables + pages; no mock imports on public routes (`CONTEXT.md`) |
| 404 / errors  | `createError`, `NotFoundException`                                   |
| Docs          | README / roadmap if AC expects it                                    |

Run `grep`, read files, cheap `npm test` / `npm run build`. Quote paths.

Spawn **one sub-agent per issue** in parallel when 2+ issues (brief: Met/Partial/Missing + evidence, under 250 words, no GitHub writes).

### 5. Decide verdict

| Verdict            | Condition                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **Complete**       | All AC **Met** on verification base                                                                  |
| **Partial**        | Any **Partial** or **Missing**                                                                       |
| **Already closed** | Issue closed — verify; comment if regressed                                                          |
| **Blocked**        | Open blockers in dependencies or body                                                                |
| **Pending merge**  | Complete on feature branch but user declined ship — treat as Complete for AC table, **do not close** |

**Close issues only when verification base is `main` and verdict is Complete.**

### 6. Sync GitHub (unless `--dry-run`)

Post one comment per issue (HEREDOC):

```markdown
## Issue review (<date>, base: `<branch>`)

| Criterion | Status                  | Evidence |
| --------- | ----------------------- | -------- |
| …         | Met / Partial / Missing | `path`   |

**Verdict:** Complete | Partial | Blocked | Pending merge

**Commits:** …
**Next:** …
```

**If Complete on `main` and issue open:**

1. `gh issue edit <n> --remove-label ready-for-agent` (ignore if absent)
2. `gh issue close <n> --comment "Verified complete by /issue-review on main."`

**If Partial or Pending merge:** comment only; leave open.

**Parent epic:** if all children closed, comment on parent and ask about closing the epic.

### 7. Report to the user

Summary table (issue, verdict, GitHub action), done / still to do, suggested next command.

## Flags

| Flag        | Effect                                                |
| ----------- | ----------------------------------------------------- |
| `--dry-run` | No push, PR, merge, comments, or closes — report only |

Branch and ship decisions are handled in step 0, not via flags.

## Relationship to other skills

```
/to-tickets → /implement → /code-review → commit
                              ↓
                       /issue-review
                              ↓ (feature branch?)
                         /ship-pr → merge main
                              ↓
                    verify + close issues
```

- **`/ship-pr`** — push, PR, merge, delete branch (also invoked from step 0).
- **`/code-review`** — pre-ship diff review.
- **`/triage`** — not for your own tickets.

## Additional resources

- AC examples: [VERIFICATION.md](VERIFICATION.md)
