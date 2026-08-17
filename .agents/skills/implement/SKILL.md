---
name: implement
description: 'Implement a piece of work based on a spec or set of tickets.'
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

## 0. Branch setup (one ticket per branch)

When the user passes a **ticket number** (GitHub issue `#N`, or a local scratch ticket `NN`), create or check out a feature branch **before** writing code. Skip this step only when the user explicitly says to stay on the current branch.

### Branch name

```
issue<N>.<slug>
```

- `<N>` — the ticket number (`4` for GitHub `#4`, `01` for scratch ticket `01-catalog.md`).
- `<slug>` — **1–3 words** from the ticket title, lowercased, hyphen-separated: `catalog`, `catalog-types`, `personal-profile-header`.

Examples: `issue4.catalog`, `issue7.news`, `issue42.personal-profile`.

Derive the slug from the ticket title — drop filler words (`add`, `implement`, `fix`, `the`, `a`) and keep the substance.

### Create the branch

Run in parallel:

```bash
git branch --show-current
git status --porcelain
git fetch origin main
```

Then:

1. **Already on `issue<N>.*` for this ticket** — continue; do not recreate.
2. **Dirty working tree** — stop and ask: commit, stash, or discard before switching.
3. **On `main` (clean)** — update and branch:

```bash
git checkout main
git pull origin main
git checkout -b issue<N>.<slug>
```

4. **Branch already exists** (local or `origin/issue<N>.<slug>`) — check it out instead of creating a duplicate:

```bash
git checkout issue<N>.<slug>
git pull origin issue<N>.<slug>   # if upstream exists; ignore if first push
```

5. **On a different feature branch (clean)** — same as (3): return to updated `main`, then `git checkout -b issue<N>.<slug>`.

Report the branch name to the user before starting implementation.

### Claim the ticket (GitHub)

When implementing a GitHub issue, assign it on first write:

```bash
gh issue edit <N> --add-assignee @me
```

## 1. Implement

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

## 2. Review and commit

Once done, use /code-review to review the work.

Commit your work to the **feature branch** (`issue<N>.<slug>`).

## 3. Close the loop

Then run /issue-review on the ticket numbers (it will offer /ship-pr if not on main).

Typical git flow end-to-end:

```
/implement #4  →  issue4.catalog
  → code + commit on branch
  → /issue-review  →  /ship-pr  →  merge + delete branch  →  issue closed
```
