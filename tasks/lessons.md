# Lessons Learned

## Workflow

### Always follow docs → tests → code order (captured 2026-03-01)

**What happened:** Implemented the mobile/desktop layout toggle feature (icon buttons, CSS
variables, Tauri resize, auto-detect) by going straight to code. No documentation was written
first and no tests were written before or during implementation.

**Rule:** For any non-trivial change, the order is always:
1. Write/update docs that describe the intended behavior and contracts
2. Write/update tests that pin that behavior
3. Write the code against the documented spec and passing tests
4. Commit only when all three are aligned

**Why it matters:** Skipping docs and tests means the interface is decided during coding
(often ad hoc), behavior is unverified, and regressions have no safety net. A working build
is not the same as a correct, maintainable, tested feature.

**Check:** Before writing any implementation code, ask: "Do docs exist for this? Do tests
exist for this?" If no to either — stop and write them first.
