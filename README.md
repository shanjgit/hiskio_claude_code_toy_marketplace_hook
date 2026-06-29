# Claude Code Toy Marketplace

This codebase was forked from [uopsdod/claude_code_toy_marketplace](https://github.com/uopsdod/claude_code_toy_marketplace.git). Many thanks to the author @uopsdod.

As teaching material for the Hiskio online course, I highly recommend this course for anyone who wants to start using Claude Code.

Check the course [page](https://hiskio.com/courses/2475?srsltid=AfmBOorPjCtGEH95wZbWu63HbikN5ayJCktSAtsg_Glk9-v0sh4q-hrZ)

---

## Demo: Theme Color Change + Browser Verification

### What We Tested

We wanted to verify that Claude Code can autonomously change a theme color, restart the dev server, open a real browser at a specific device viewport, visually confirm the result via screenshot, and close the browser — all from a single prompt.

### The Prompt

```
restart the webserver. use the Dimensions: iPhone 12 Pro (390 x 844)
the current theme color is blue, change it to yellow. go to the homepage, take a screenshot named
"homepage-yellow.png" to verify your change until you implement it correctly.
close the browser in the end.
```

### Hook Notification

The project has a **Notification hook** configured in `.claude/settings.json`. It fires whenever Claude Code needs your attention or finishes a long-running task. Instead of requiring you to watch the terminal, it runs a custom script that plays an MP3 sound effect — so you get an audio alert automatically.

The hook was triggered at the end of this session when Claude Code completed the task and sent a "task done" notification to the user.

### Result

![Homepage with yellow theme at iPhone 12 Pro dimensions](homepage-yellow.png)

---

## Demo: PostToolUse Hook — Automatic Test Runner

### What the PostToolUse Hook Does

A `PostToolUse` hook is configured in `.claude/settings.json` to fire automatically after every `Edit`, `MultiEdit`, or `Write` tool call. The hook script lives at `.claude/hooks/test_runner_hook.ts` and acts as a silent test guardian: every time Claude modifies a source file, the hook immediately runs the project's test suite and feeds the result back into the conversation as a `systemMessage`.

```json
"PostToolUse": [
  {
    "matcher": "Edit|MultiEdit|Write",
    "hooks": [{ "type": "command", "command": "node .claude/hooks/test_runner_hook.ts" }]
  }
]
```

### How the Hook Decides Whether to Run Tests

The hook applies a filter via `isSourceCodeFile()` before running anything:

- **Must be inside `src/`** — edits to `vite.config.ts`, `package.json`, etc. are skipped.
- **Must have a code extension** — `.ts`, `.tsx`, `.js`, `.jsx`.
- **Must not be a test file** — files matching `.test.` or `.spec.` are excluded so the hook never triggers itself when Claude writes or updates tests.

### What Happened in This Session

The log at `.claude/hooks/test_hook_debug.log` records the full execution trace. Here is what occurred step by step:

| Tool call | File modified | Action taken | Outcome |
|---|---|---|---|
| Edit | `vite.config.ts` | Outside `src/` → skipped | No action |
| Edit | `package.json` | Outside `src/` → skipped | No action |
| Edit | `src/hooks/usePublicProducts.tsx` | Source file → ran `npm test` | **Failed** (no test file existed yet) |
| Write | `src/test/setup.ts` | Source file → ran `npm test` | **Failed** (test file still missing) |
| Write | `src/components/FilterSheet.test.tsx` | Test file → skipped (`.test.tsx`) | No action |
| Edit | `src/hooks/usePublicProducts.tsx` | Source file → ran `npm test` | **Passed** ✅ (11/11) |
| Write | `src/components/FilterSheet.test.tsx` | Test file → skipped | No action |
| Edit | `src/components/FilterSheet.tsx` | Source file → ran `npm test` | **Failed** (8/24 tests failed — Price radio removed, price-related tests now broken) |

### Key Design Decisions

- **Never blocks the workflow.** The hook always outputs `permissionDecision: 'allow'` regardless of test outcome, so Claude can continue working even when tests are red.
- **Reports back via `systemMessage`.** Pass/fail results are injected directly into the conversation, so Claude sees `✅ Tests passed` or `❌ Tests failed` immediately after each file edit without any extra prompting.
- **Ignores test files.** Excluding `.test.` files prevents an infinite loop where writing a test file would trigger a test run that finds a broken test that triggers another run.
- **Early failure is informative.** The two early failures (when `usePublicProducts.tsx` was edited before the test file existed) showed the hook was active and looking for tests — confirming the setup was wired correctly before the test file was written.

The final failure — 8 tests failing after the Price radio was removed from `FilterSheet.tsx` — is exactly the hook doing its job: the tests immediately flagged that the component no longer matched what the test suite expected, giving a clear signal that the tests need to be updated to match the new "Date Added only" behaviour.
