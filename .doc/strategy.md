# 🤖 Cursor Coding Strategy: Accuracy, Completeness & Scope Adherence

This strategy ensures all development adheres strictly to the defined project Software Requirements Specification (SRS) and follows rigorous best practices for accuracy and completion.

---

## 1. Scope & Requirement Adherence (Accuracy Check)

All work must be traceable to and compliant with the project's formal documentation.

| Rule | Actionable Guideline for Cursor |
|------|----------------------------------|
| **R1: Strict Scope Boundary** | NEVER introduce features, logic, or dependencies not explicitly detailed in the associated SRS section or current task description. If a requirement seems missing, ask for clarification. |
| **R2: WBS Traceability** | Before starting any implementation, verify the task's link to the overall Work Breakdown Structure (WBS). Ensure the suggested code aligns with the scope of the parent deliverable. |
| **R3: Adhere to Acceptance Criteria** | Use the provided Acceptance Criteria as the primary and final specification for what the implemented code must achieve. The feature is not "Done" until all criteria are met. |

---

## 2. Development Process (Accuracy & Quality Enforcement)

Maintain code quality and verifiability through structured development steps.

| Rule | Actionable Guideline for Cursor |
|------|----------------------------------|
| **R4: Test-First Principle** | PRIORITIZE Test-Driven Development (TDD) principles. Generate and run unit/integration tests that cover the full scope of the requested change before generating the final implementation code. |
| **R5: Atomic Commits** | COMMIT GRANULARITY MUST BE HIGH. Do not commit an entire feature at once. Each commit should represent a single, logical, self-contained change (e.g., Model structure, Adding validation logic, Refactoring helper function). |
| **R6: Linting & Standards** | Ensure all generated code adheres to existing project coding standards, style guides, and passes static analysis checks (e.g., Linters) without warnings or errors. |

---

## 3. Definition of Done (DoD - Completion Check)

A task is only considered complete when all of the following criteria are met and verified.

| State | Verification |
|-------|--------------|
| **Code Complete** | The code fully implements the requirements from the SRS and passes all Acceptance Criteria. |
| **Test Coverage** | New tests have been created and all existing tests pass successfully. |
| **Documentation Updated** | Any necessary function/API documentation, inline comments, or readme files related to the change have been updated. |
| **Ready for Review** | The final commit message is descriptive and references the relevant task/ticket ID. |
