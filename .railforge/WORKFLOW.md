# Workflow

## Source of truth

Conversation, agent memory, and agent reasoning do not replace the state recorded in the repository.

The canonical workflow state is `.railforge/state.json`. It is versioned, small, and updated manually when a task changes stage or is completed. It is not an execution log.

Other versioned project artifacts may record requirements, decisions, plans, and validation results when useful for the task.

## Mobile context

This variant applies to a user-facing mobile application built with React Native and Expo.

When a task affects the application interface, its requirements or plan should identify the affected user flow and relevant application states. Relevant states may include loading, empty, error, success, confirmation, and permission or access states. Expo Go may be used to preview and verify affected flows when it is available and relevant. Desktop web behavior is outside the default scope unless explicitly requested.

## Flow

Use the stages below in proportion to the size and risk of the change:

1. `DISCOVERY` — clarify questions and record relevant decisions.
2. `REQUIREMENTS` — define the goal, criteria, constraints, and non-goals.
3. `PLANNING` — define the plan, files in scope, risks, and validation approach.
4. `IMPLEMENTING` — change only the approved scope.
5. `VALIDATING` — run the available and relevant checks, then review the diff.
6. `REVIEWING` — confirm the criteria and record any remaining items.
7. `COMPLETED` — record the delivery as complete. Committing is a separate action and requires explicit user authorization.

For small, clear changes, requirements, planning, and review may be brief and recorded in existing artifacts.

Attention states:

- `BLOCKED`
- `VALIDATION_FAILED`
- `REVIEW_FAILED`

## Rules

- Do not implement before understanding the relevant goal, scope, and criteria.
- Do not implement outside the active task or silently expand its scope.
- Run only the build, lint, tests, or other checks that exist and are relevant to the change.
- For mobile interface changes, verify the affected user flow and consider relevant application and accessibility states; use Expo Go when it is available and relevant.
- If there is material ambiguity, record the question in the state or appropriate artifact and request clarification before implementing.
- Never commit without explicit user authorization.
