---
name: ship-pr
description: Push the current branch, open a pull request to main, merge it, and delete the feature branch. Use when the user runs /ship-pr, agrees to merge during /issue-review, or when /implement -auto completes review.
disable-model-invocation: true
---

# Ship PR

Push the **current branch** to `main` through a GitHub pull request: create (or reuse) the PR, merge, delete the remote branch, sync local `main`.

Use **`gh`** for all GitHub operations per `docs/agents/issue-tracker.md` and the user's PR workflow (push → `gh pr create` → merge).

## Preconditions

Stop and report if any fail (unless `--force` is explicitly passed for push-only recovery):

1. **Not on `main`/`master`** — `git branch --show-current` must be a feature branch.
2. **Clean working tree** — no uncommitted changes (`git status --porcelain` empty). If dirty, ask whether to commit first or stash; do not merge with uncommitted work.
3. **`gh auth status`** succeeds.
4. **Base branch exists** — default `main` (`git rev-parse main` or `origin/main`).

## Process

### 1. Gather context

Run in parallel:

```bash
git branch --show-current
git status
git log main..HEAD --oneline
git diff main...HEAD --stat
gh pr list --head "$(git branch --show-current)" --state open --json number,url,title
```

Parse issue references from commit subjects and branch name (`#4`, `#6`, `issue7.news` → mention in body).

### 2. Push

```bash
git push -u origin HEAD
```

If push fails, diagnose (auth, upstream, non-fast-forward) and stop.

### 3. Create PR (if none open)

If an open PR already exists for this head branch, use it — do not create a duplicate.

Otherwise draft title and body from commits + diff stat. Include `Closes #N` lines for every issue number found in commits (so GitHub auto-closes on merge).

```bash
gh pr create --base main --head "$(git branch --show-current)" \
  --title "..." \
  --body "$(cat <<'EOF'
## Summary
…

## Test plan
- [ ] …

Closes #N
EOF
)"
```

Return the PR URL.

### 4. Merge

```bash
gh pr checks <number> --watch --fail-fast
```

If checks fail, stop and report — do not merge until green (or user explicitly says to merge anyway).

Then merge and delete the remote branch:

```bash
gh pr merge <number> --merge --delete-branch
```

Use `--squash` only when the user asks for squash merge.

### 5. Sync local repo

```bash
git checkout main
git pull origin main
git branch -d <feature-branch>   # ignore error if already deleted
```

Confirm `HEAD` is on `main` and includes the merged commits.

### 6. Report

Return:

- PR URL
- Merge commit / merge method
- Branch deleted (remote + local)
- Issue numbers referenced in PR body (`Closes #N`)

## Flags

| Flag                 | Effect                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `--dry-run`          | Show planned commands, title/body draft, and PR number if exists — no push, create, merge, or delete |
| `--no-delete-branch` | Merge but keep the remote branch (still checkout `main` locally)                                     |

## Called from `/issue-review` or `/implement -auto`

When **`/issue-review --auto-ship`** or **`/implement -auto`** reaches the ship step, run this skill **without asking** — merge is already decided. After a successful ship, return control to `issue-review` with verification base `main`.

When **`/issue-review`** (no `--auto-ship`) asks the user to ship and they agree, run this skill before verifying issues on `main`.

## Guardrails

- Never force-push to `main`.
- Never `gh pr merge --admin` unless the user explicitly requests bypassing failed checks.
- Never delete `main` or the default branch.
- Do not amend or rewrite history unless the user asks.
