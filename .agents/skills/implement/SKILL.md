---
name: implement
description: 'Implement a piece of work based on a spec or set of tickets. Default mode stops after review for manual merge; -auto runs the full ship pipeline.'
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

## Flags

| Flag        | Effect                                                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(none)**  | **Manual mode** — implement, deslop, code-review, fix, commit on the feature branch, **stop and report**. User reviews locally, then runs `/ship-pr` when ready. |
| **`-auto`** | **Auto mode** — same as manual through commit, then automatically run `/ship-pr` and `/issue-review` (no merge prompt).                                          |

Parse the flag from the user prompt: `/implement #9 -auto`, `/implement issue 9 --auto`, etc.

**Questions during work are always allowed** in both modes (blockers, ambiguous spec, destructive git ops). In **`-auto`**, do **not** ask whether to ship — shipping is implicit.

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

Use `/tdd` where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

## 2. Deslop

Run **`/deslop`** (read the deslop skill) against `git diff main...HEAD`. Remove AI slop introduced on this branch; keep behaviour unchanged unless fixing a clear bug.

## 3. Code review and fixes

Run **`/code-review`** with fixed point **`main`** (three-dot diff: `git diff main...HEAD`).

**Act on findings before committing:**

| Finding                                         | Action                                                                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Quick fix (bug, spec miss, obvious smell)       | Fix now; re-run affected tests                                                                                                                   |
| Inconvenient / slow refactor, not blocking ship | **Defer** — open a follow-up GitHub issue immediately (`gh issue create`) with context and link from the implementation report so it is not lost |
| False positive                                  | Note in report; no change                                                                                                                        |

If deslop or review edits code, run tests again before commit.

## 4. Commit

Commit all work to the **feature branch** (`issue<N>.<slug>`). One commit is fine unless the repo habit is otherwise.

## 5. Close the loop — depends on mode

### Manual mode (default)

**Stop here.** Report to the user:

1. **Implemented** — branch name, ticket(s), short summary of behaviour
2. **Deslop** — what was cleaned (or “nothing needed”)
3. **Code review** — findings, what was fixed, what was deferred (with new issue numbers)
4. **Tests** — what ran and passed
5. **Next step** — user should try the feature locally, then run **`/ship-pr`** when satisfied

Do **not** run `/ship-pr` or `/issue-review` unless the user asks or passed **`-auto`**.

### Auto mode (`-auto`)

Continue without asking:

1. Run **`/ship-pr`** (read `.agents/skills/ship-pr/SKILL.md` and execute it).
2. Run **`/issue-review`** on the ticket number(s) with **`--auto-ship`** so it verifies on `main` without a merge prompt.

Report the full pipeline result: PR URL, merge status, issue-review verdict, any deferred follow-up issues.

## Typical flows

**Manual (default):**

```
/implement #9
  → issue9.<slug>
  → implement → deslop → code-review → fix → commit
  → report → (user checks) → /ship-pr → /issue-review
```

**Auto:**

```
/implement #9 -auto
  → issue9.<slug>
  → implement → deslop → code-review → fix → commit
  → /ship-pr → /issue-review --auto-ship
  → issue closed on main
```
