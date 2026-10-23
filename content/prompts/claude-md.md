Write a CLAUDE.md for this project — the file Claude Code reads at the start of
every session, so I never have to re-explain my stack, my rules or my folders
again.

Don't write it from guesses. Explore the repo first, then ask me only what the
code can't tell you, then write the file and prove the commands in it work.

## Step 1 — Explore (read, don't edit)

Look at, at minimum:
- the package manifest(s) and lockfile (package.json, pyproject.toml, go.mod, …)
- framework and tool configs (next.config, vite.config, tsconfig, eslint,
  prettier, tailwind, docker, CI workflows)
- the top two levels of the folder tree, and one or two typical files in each
  main folder, to learn the real naming and code style
- README, any existing CLAUDE.md / AGENTS.md / .cursorrules, and .env.example
- the last ~20 commit messages, to learn the commit style

## Step 2 — Ask me (one short message, max 6 questions)

Only ask what you could not infer, for example:
- what the product does, in one sentence, and who it's for
- rules you must never break (e.g. "never touch the payments folder",
  "no new dependencies without asking")
- how I like to work (small PRs? tests first? explain before coding?)
- anything that regularly goes wrong in this repo

## Step 3 — Write CLAUDE.md at the repo root

Use exactly these sections, in this order. Be specific and short: bullet
points, real paths, real commands. Aim for 60–120 lines total — every line
is read every session, so cut anything generic.

```
# <Project name>
One sentence: what it is and who it's for.

## Stack
Languages, framework + version, database, auth, hosting, key libraries.

## Commands
dev, build, test (all + single file), lint, typecheck, format, db migrate.
Only commands you have actually run successfully in Step 4.

## Map
The folders that matter, one line each: what lives there and what doesn't.

## Conventions
Naming, file structure, state, styling, error handling, imports —
as they ARE in this codebase, with one example path each.

## Rules
- ALWAYS: …
- NEVER: …
(the hard rules from my answers, plus anything dangerous you found:
secrets, generated files, migrations, protected folders)

## Workflow
How to work with me: plan first or just do it, test expectations,
commit message style, when to ask before acting.

## Gotchas
Non-obvious traps you noticed: env vars needed, ports, flaky tests,
order-of-operations, legacy code not to copy.
```

## Step 4 — Verify

- Run every command you put under "Commands". If one fails, fix the line or
  remove it — never leave an untested command in the file.
- Re-read the file and delete anything that would be true of *any* project.
- If a folder has its own very different rules (e.g. a separate backend or
  mobile app), create a short CLAUDE.md inside that folder too, and say so.

## Step 5 — Hand over

Show me the final file, list what you inferred vs. what I told you, and
suggest 2–3 rules I might want to add after a week of using it.

Do not change any code in this task — only create CLAUDE.md file(s).
