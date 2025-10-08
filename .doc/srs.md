# Software Requirements Specification (SRS)
## Project: Vibe Code Assistant

### 1. Introduction

#### 1.1 Purpose
Vibe Code Assistant is a web-based AI coding assistant designed to generate, fix, explain, and merge code snippets using the Gemini API.  
It enables developers to work efficiently with an AI-driven interface directly in the browser, powered by React, Tailwind, and Vercel Edge Functions.

#### 1.2 Scope
The system provides:
- Code generation from prompts.
- Bug fixing and code explanation.
- Workspace for managing multiple snippets.
- Support for image-based prompts.
- Code-only validation for clean AI context.
- Serverless deployment via Vercel Edge Functions.

The goal is a **lightweight, AI-assisted coding tool** that minimizes backend dependencies and ensures efficient execution using **serverless and edge runtime technologies**.

#### 1.3 Intended Audience
- Developers and learners using AI for code assistance.
- Technical reviewers verifying correctness and performance.
- Contributors maintaining the frontend and Edge Function logic.

#### 1.4 Definitions
- **Snippet:** A piece of code generated, fixed, or merged by AI.
- **Edge Function:** A serverless function deployed on Vercel’s edge network to handle AI requests.
- **Gemini API:** Google’s generative AI model used for code understanding and generation.
- **Workspace:** The collection of snippets managed by the user within the app.

---

### 2. Overall Description

#### 2.1 Product Perspective
Vibe Code Assistant is a **standalone frontend** with **Edge Functions** acting as a bridge to the Gemini API.  
No dedicated backend or database is required; all workspace data is stored in memory or localStorage.

#### 2.2 Product Functions
1. Generate code from natural-language prompts.
2. Fix and explain existing code snippets.
3. Manage snippets via workspace (add, edit, delete, merge).
4. Accept and interpret images as part of prompts.
5. Validate input to accept code-only content.
6. Deploy on Vercel with edge-level efficiency.

#### 2.3 User Classes and Characteristics
- **General users:** Create and test small code snippets.
- **Developers:** Use workspace features for quick prototyping or debugging.

#### 2.4 Operating Environment
- **Frontend:** React + Tailwind CSS  
- **Runtime:** Vercel Edge Functions (Node 18+ compatible)
- **AI API:** Gemini (via RESTful or SDK interface)
- **Supported Browsers:** Chrome, Edge, Firefox, Safari (latest versions)

---

### 3. System Features

#### Phase 1 – Project Setup
**Objective:** Establish the core environment and deployment pipeline.  
**Requirements:**
- R1.1: Initialize React + Tailwind project.
- R1.2: Set up Vercel deployment with Edge Function support.
- R1.3: Install dependencies (Axios/fetch, state, optional editor).
- R1.4: Configure Gemini API key in environment variables.
**Validation:** Blank page deploys successfully and Edge Function returns test JSON.

---

#### Phase 2 – Basic AI Code Generation
**Objective:** Enable users to generate code from text prompts.  
**Requirements:**
- R2.1: Implement `PromptInput` and `SnippetViewer`.
- R2.2: Edge Function should handle `generate` action.
- R2.3: AI responses should display with syntax formatting.
- R2.4: Handle network and API errors gracefully.
**Validation:** Prompt input → AI response → formatted output verified.

---

#### Phase 3 – Workspace Management
**Objective:** Support multiple code snippets with edit, delete, and merge features.  
**Requirements:**
- R3.1: Implement `Workspace` component.
- R3.2: Support add, edit, delete, and reorder snippets.
- R3.3: Implement merge feature using Gemini AI.
**Validation:** Workspace operations persist and AI-generated merges compile correctly.

---

#### Phase 4 – Bug Fix & Explanation
**Objective:** Provide AI-based code debugging and explanations.  
**Requirements:**
- R4.1: Add `Fix Bug` and `Explain` options to each snippet.
- R4.2: Edge Function should handle `fix` and `explain` actions.
- R4.3: System must detect and reject non-code input.
**Validation:** Fixed code executes properly; explanations are consistent; invalid inputs prompt warnings.

---

#### Phase 5 – Image Attachment
**Objective:** Allow users to upload images to enhance context for AI prompts.  
**Requirements:**
- R5.1: Add image upload in `PromptInput` and `SnippetViewer`.
- R5.2: Edge Function must accept Base64 or URL image inputs.
- R5.3: Gemini API prompt includes image reference.
**Validation:** Uploaded images appear in workspace; Gemini responses align with image context.

---

#### Phase 6 – Input Validation & Code-Only Enforcement
**Objective:** Ensure only code-related content is processed.  
**Requirements:**
- R6.1: Edge Function must reject non-code content.
- R6.2: Frontend should display appropriate warnings.
- R6.3: Invalid snippets must not enter workspace.
**Validation:** Non-code input always produces a clear rejection message.

---

#### Phase 7 – Deployment & Testing
**Objective:** Final testing and production release.  
**Requirements:**
- R7.1: Test all user flows end-to-end.
- R7.2: Verify AI responses across generate/fix/explain/merge.
- R7.3: Deploy to Vercel production.
- R7.4: Ensure low-latency and stable response times.
**Validation:** All workflows validated; production app fully functional.

---

### 4. Non-Functional Requirements
- **Performance:** Edge Function responses < 2s average.
- **Scalability:** Handle concurrent requests efficiently on Vercel Edge.
- **Reliability:** 99% uptime target for deployed app.
- **Security:** API key stored securely via environment variables.
- **Maintainability:** Modular component and function architecture.
- **Usability:** Simple, intuitive interface suitable for rapid prototyping.

---

### 5. Constraints
- No dedicated backend or database.
- Reliance on Gemini API for all AI logic.
- Edge Function resource and execution limits (Vercel restrictions).
- Browser localStorage only for workspace persistence.

---

### 6. Testing Strategy
**Before moving to the next feature or phase:**
1. Unit test all new functions and components.
2. Manually validate workflow in UI.
3. Confirm AI response correctness.
4. Commit with validation message (`feat: phase_X_validated`).
5. Deploy to preview branch and verify before merging to main.

**Each commit must:**
- Pass validation checklist for current phase.
- Not introduce regressions in previous features.
- Include minimal, focused implementation changes.

---

### 7. Future Enhancements
- Multi-file workspace with syntax highlighting.
- Cloud sync of user workspace.
- Plugin integration for IDE-like behavior.
- Multi-model support (Gemini + GPT + Claude).

---

### 8. Approval
This SRS serves as the foundation for development.  
Each phase should be validated and committed only after successful testing, ensuring minimal waste and consistent progress.

**Document Version:** 1.0  
**Author:** Rith  
**Date:** October 2025
