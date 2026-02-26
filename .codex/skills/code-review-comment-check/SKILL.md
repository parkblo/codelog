---
name: code-review-comment-check
description: Analyze pull request review comments and validate whether each suggestion is appropriate against the real codebase. Use when the user asks for code review comment analysis, PR comment triage, gemini-code-assist comment review, or says "코드 리뷰 검토". Fetch the PR linked to the current branch, review gemini-code-assist comments one by one, explain each comment, provide a verdict with rationale, and propose concrete fix steps without applying code changes until explicit start instructions are given.
---

# Code Review Comment Check

## Goal
- Review PR comments from `gemini-code-assist` with codebase evidence.
- Decide whether each suggestion should be accepted, partially accepted, or rejected.
- Provide actionable fix guidance while keeping the working tree unchanged until explicitly told to start editing.

## Required Workflow
1. Identify branch and PR
- Read current branch name from git.
- Resolve repository owner/name from the git remote.
- Use GitHub MCP to find the PR associated with the current branch.
- If multiple PRs match, use the most recently updated open PR and report the selection.

2. Collect review comments
- Load PR review comments through GitHub MCP.
- Filter comments authored by `gemini-code-assist`.
- If no matching comments exist, report that clearly and stop.

3. Evaluate each comment against real code
- For each comment, inspect referenced files/lines with Serena and local code.
- Explain the comment intent in plain language.
- Judge validity using one verdict:
  - `Accept`: suggestion is correct and should be implemented.
  - `Partial`: direction is useful but requires adjustment.
  - `Reject`: suggestion is outdated, incorrect, or not suitable.
- Provide concise evidence tied to current code context.
- Propose concrete implementation steps (files/functions to touch and change outline).

4. Hold before implementation
- Do not modify files during this skill flow.
- After analysis, wait for an explicit instruction such as "start", "apply fixes", or equivalent.

## Output Format
- PR context: branch, PR number/title, analyzed comment count.
- Per-comment result:
  - Comment reference (file/line or link)
  - Intent summary
  - Verdict (`Accept` | `Partial` | `Reject`)
  - Evidence from current codebase
  - Proposed fix approach
- Final section:
  - Prioritized fix checklist
  - Explicit wait state: "No code changes applied yet."
