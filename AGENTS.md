This repository uses a lightweight, educational Railforge workflow based on documentation and review. It has no Railforge engine, CLI, hooks, generated runtime, or versioned execution environment.

This mobile variant is for a user-facing application built with React Native and Expo. Preserve the established component, navigation, state-management, and styling patterns. Use Expo Go to preview and verify affected user flows when it is available and relevant to the change. Desktop web support is outside the default scope unless the active task explicitly requires it.

Before making a development change:

1. Read `.railforge/PRINCIPLES.md` and `.railforge/WORKFLOW.md` when they are relevant to the task.
2. Read `.railforge/state.json` and confirm the current stage before acting.
3. Define or refine the active requirement and a proportional plan before coding.
4. Identify the files in scope and inspect the final diff before finishing. For user-interface changes, identify the affected user flow and relevant application states.
5. Run the build, lint, tests, or other validation checks that are available and relevant to the change. For user-interface changes, verify the affected flow and relevant loading, empty, error, success, confirmation, or permission states; use Expo Go when it is available and relevant.
6. Update `.railforge/state.json` manually when the task changes stage or is completed, then re-read it before finishing.
7. Do not implement outside the active task or expand scope silently.
8. If requirements are ambiguous, record the uncertainty and request clarification before proceeding with implementation.

`.railforge/state.json` is the single versioned workflow state. Keep it small and manual: record the stage, task, scope, validation results, review, and date. Do not add event logs, generated snapshots, temporary execution data, or runtime metadata.

Do not create Railforge files, automation, or tooling merely to satisfy this workflow. Use only the documented files and practices that exist in this repository.
