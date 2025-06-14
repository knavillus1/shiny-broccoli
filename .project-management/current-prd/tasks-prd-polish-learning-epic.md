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
- `frontend/src/components/PromptInput.tsx` - Include sample prompts and accessibility improvements.
- `frontend/src/components/FileUpload.tsx` - Add accessible labels and focus states.
- `frontend/src/components/CanvasDisplay.tsx` - Ensure focus outlines and labels.
- `frontend/src/components/ResultsDisplay.tsx` - Add accessible toggle labels.
- `frontend/src/components/ErrorBoundary.tsx` - Label reset button.
- `frontend/src/components/MaskToolbar.tsx` - Improve focus visibility on inputs.
- `frontend/src/components/PromptInput.test.tsx` - Test placeholder prompt.
- `frontend/src/components/FileUpload.test.tsx` - Test upload button label.
- `frontend/src/components/CanvasDisplay.test.tsx` - Check accessibility label.
- `CHANGELOG.md` - Record progress entries.
- `.project-management/current-prd/tasks-prd-polish-learning-epic.md` - Update task status.
- `backend/app/__init__.py` - Module metadata for backend package.
- `backend/app/api/__init__.py` - Module metadata for API package.
- `backend/app/api/v1/__init__.py` - Module metadata for API version package.
- `backend/app/api/v1/endpoints/__init__.py` - Module metadata for endpoint package.
- `backend/app/api/v1/endpoints/health.py` - Health endpoint with docs.
- `backend/app/core/__init__.py` - Module metadata for core package.
- `backend/app/middleware.py` - Timing middleware docstring added.
- `frontend/src/components/ChatArea.tsx` - Placeholder chat area component.
- `frontend/src/components/MessageBubble.tsx` - Placeholder chat message bubble.
- `frontend/src/components/Sidebar.tsx` - Placeholder sidebar component.
- `frontend/src/hooks/useChat.ts` - Placeholder chat hook with docs.

## Tasks

 - [x] 1.0 Document Codebase for Learning (FR1, FR2)
   - [x] 1.1 Add explanatory comments to all frontend components and hooks.
   - [x] 1.2 Add docstrings to all backend modules and services.
   - [x] 1.3 Run linting to verify comment style.

- [x] 2.0 Expand Project Documentation (FR3, FR4, FR5)
  - [x] 2.1 Add a step-by-step tutorial to `README.md` with learning resources.
  - [x] 2.2 Update `DEVELOPMENT.md` with explicit environment setup instructions.
  - [x] 2.3 Create `.env.template` files for backend and frontend.
  - [x] 2.4 Update `dev_init.sh` to copy `.env.template` when `.env` is missing.

- [x] 3.0 Improve UI Prompting and Accessibility (FR6, FR7)
  - [x] 3.1 Provide example prompts within `PromptInput.tsx`.
  - [x] 3.2 Ensure all forms and buttons have accessible labels.
  - [x] 3.3 Add focus states for interactive elements.
  - [x] 3.4 Update or create tests for new prompts and accessibility attributes.

- [x] 4.0 Verify Success Metrics (SM1-SM3)
  - [x] 4.1 Run `run_tests.sh -no_integration` and ensure it passes.
  - [x] 4.2 Confirm code coverage remains stable after documentation updates.
  - [x] 4.3 Update `CHANGELOG.md` with progress for each completed task.
