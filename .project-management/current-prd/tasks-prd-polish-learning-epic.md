## Pre-Feature Development Project Tree
```
 AGENTS.md
 CHANGELOG.md
 DEVELOPMENT.md
 LICENSE
 README.md
 backend/
        app/
                __init__.py
                api/
                        __init__.py
                        v1/
                                __init__.py
                                endpoints/
                                        __init__.py
                                        health.py
                                        images.py
                                        openai_integration.py
                core/
                        __init__.py
                        config.py
                logging.py
                main.py
                middleware.py
        requirements.txt
        services/
                chat_storage.py
                image_processor.py
                openai_service.py
                task_manager.py
        start.sh
        tests/
                api/
                        __init__.py
                        v1/
                                __init__.py
                                test_health.py
                                test_images.py
                integration/
                        test_workflow.py
                unit/
                        services/
                                test_openai_service.py
                conftest.py
 dev_init.sh
 docs/
        user_guide.md
 frontend/
        eslint.config.js
        index.html
        package.json
        src/
                App.test.tsx
                App.tsx
                components/
                        CanvasDisplay.test.tsx
                        CanvasDisplay.tsx
                        ChatArea.tsx
                        ErrorBoundary.test.tsx
                        ErrorBoundary.tsx
                        FileUpload.test.tsx
                        FileUpload.tsx
                        HealthCheckDisplay.tsx
                        MaskToolbar.test.tsx
                        MaskToolbar.tsx
                        MessageBubble.tsx
                        ProgressIndicator.test.tsx
                        ProgressIndicator.tsx
                        PromptInput.test.tsx
                        PromptInput.tsx
                        ResultsDisplay.test.tsx
                        ResultsDisplay.tsx
                        Sidebar.tsx
                hooks/
                        useCanvas.test.tsx
                        useCanvas.ts
                        useChat.ts
                main.tsx
                pages/
                        HomePage.tsx
                router.tsx
                services/
                        apiClient.test.ts
                        apiClient.ts
 run_tests.sh
```

## Relevant Files
### Proposed New Files
- `backend/.env.template` - Example environment variables for backend.
- `frontend/.env.template` - Example environment variables for frontend.

### Existing Files Modified
- `README.md` - Add beginner-friendly tutorial.
- `DEVELOPMENT.md` - Document full environment setup steps.
- `dev_init.sh` - Utilize `.env.template` files if `.env` is missing.
- `frontend/src/components/PromptInput.tsx` - Include sample prompts.
- `frontend/src/components/FileUpload.tsx` - Add accessible labels.
- `frontend/src/components/CanvasDisplay.tsx` - Ensure focus outlines.
- `CHANGELOG.md` - Record progress entries.

## Tasks

- [ ] 1.0 Document Codebase for Learning (FR1, FR2)
  - [ ] 1.1 Add explanatory comments to all frontend components and hooks.
  - [ ] 1.2 Add docstrings to all backend modules and services.
  - [ ] 1.3 Run linting to verify comment style.

- [ ] 2.0 Expand Project Documentation (FR3, FR4, FR5)
  - [ ] 2.1 Add a step-by-step tutorial to `README.md` with learning resources.
  - [ ] 2.2 Update `DEVELOPMENT.md` with explicit environment setup instructions.
  - [ ] 2.3 Create `.env.template` files for backend and frontend.
  - [ ] 2.4 Update `dev_init.sh` to copy `.env.template` when `.env` is missing.

- [ ] 3.0 Improve UI Prompting and Accessibility (FR6, FR7)
  - [ ] 3.1 Provide example prompts within `PromptInput.tsx`.
  - [ ] 3.2 Ensure all forms and buttons have accessible labels.
  - [ ] 3.3 Add focus states for interactive elements.
  - [ ] 3.4 Update or create tests for new prompts and accessibility attributes.

- [ ] 4.0 Verify Success Metrics (SM1-SM3)
  - [ ] 4.1 Run `run_tests.sh -no_integration` and ensure it passes.
  - [ ] 4.2 Confirm code coverage remains stable after documentation updates.
  - [ ] 4.3 Update `CHANGELOG.md` with progress for each completed task.
