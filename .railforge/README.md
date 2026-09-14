# Railforge Mobile

Railforge is a lightweight, educational workflow for keeping software changes understandable, scoped, and reviewable. In this repository, it is documentation-based: it has no engine, CLI, hooks, generated runtime, or automatic enforcement.

This variant is intended for user-facing mobile applications built with React Native and Expo.

Desktop web support is outside this variant's default scope.

## Purpose

The workflow makes the relevant task state, requirements, scope, validation, and review visible in versioned repository artifacts. This provides persistent context that does not depend on a conversation, agent memory, or individual recollection.

Railforge is intended to support deliberate development work, not to replace engineering judgment or create process overhead for its own sake.

## Repository artifacts

`state.json` is the canonical workflow-state file. It records the current stage of a task and a concise summary of its scope, validation, and review status. It is versioned and intentionally small; it is not an execution log.

`PRINCIPLES.md` describes the values that guide the workflow. `WORKFLOW.md` defines its stages, attention states, and rules.

The `templates/` directory contains starter structures for workflow artifacts:

- `requirement.md` describes a requirement's objective, acceptance criteria, constraints, and non-goals.
- `card.md` describes a task card, its related requirements, and its definition of done.

Plans, decisions, and discoveries may be represented by additional versioned artifacts when they add clarity to a non-trivial, risky, or ambiguous task.

For mobile work, these artifacts may also describe the affected user flow, relevant application states, accessibility considerations, and device, platform, or Expo Go verification when relevant.

## Boundaries

Railforge does not create, manage, validate, or enforce these artifacts automatically. They are maintained by the people and agents working in the repository.

The workflow is applied in proportion to the size, risk, and ambiguity of a change. It supports clear records and review while avoiding unnecessary documentation for small, straightforward work.

Railforge does not manage mobile devices, Expo Go sessions, platform credentials, or deployment configuration. Those details remain outside versioned workflow artifacts.
