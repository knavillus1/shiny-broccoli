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
 		main.py
 		api/
 			__init__.py
 			v1/
 				__init__.py
 				endpoints/
 					__init__.py
 					health.py
 					images.py
 		core/
 			__init__.py
 			config.py
 	requirements.txt
 	services/
 		chat_storage.py
 		image_processor.py
 	start.sh
 	tests/
 		__init__.py
 		api/
 			__init__.py
 			v1/
 				__init__.py
 				test_health.py
 				test_images.py
 		conftest.py
 dev_init.sh
 frontend/
 	eslint.config.js
 	index.html
 	package.json
 	src/
 		App.test.tsx
 		App.tsx
 		main.tsx
 		router.tsx
 		components/
 			CanvasDisplay.tsx
 			CanvasDisplay.test.tsx
 			ChatArea.tsx
 			FileUpload.tsx
 			FileUpload.test.tsx
 			HealthCheckDisplay.tsx
 			MessageBubble.tsx
 			Sidebar.tsx
 		hooks/
 			useCanvas.ts
 			useCanvas.test.tsx
 			useChat.ts
 		pages/
 			HomePage.tsx
 		services/
 			apiClient.ts
 	vite.config.ts
 run_tests.sh
```

## Relevant Files
### Proposed New Files
- `frontend/src/components/PromptInput.tsx` - Component for entering and managing editing prompts.
- `frontend/src/components/PromptInput.test.tsx` - Unit tests for `PromptInput` component.
- `frontend/src/components/MaskToolbar.tsx` - Advanced drawing tools with brush sizes, shapes, undo/redo.
- `frontend/src/components/MaskToolbar.test.tsx` - Unit tests for `MaskToolbar` component.
- `frontend/src/components/ResultsDisplay.tsx` - Before/after image comparison display.
- `frontend/src/components/ResultsDisplay.test.tsx` - Unit tests for `ResultsDisplay` component.
- `frontend/src/components/ProgressIndicator.tsx` - Loading states and progress feedback.
- `frontend/src/components/ProgressIndicator.test.tsx` - Unit tests for `ProgressIndicator` component.
- `frontend/src/components/ErrorBoundary.tsx` - Error handling and recovery component.
- `frontend/src/components/ErrorBoundary.test.tsx` - Unit tests for `ErrorBoundary` component.
- `backend/app/api/v1/endpoints/openai_integration.py` - OpenAI API integration endpoints.
- `backend/services/openai_service.py` - Service for handling OpenAI API calls.
- `backend/tests/api/v1/test_openai_integration.py` - Unit tests for OpenAI integration endpoints.
- `backend/tests/services/test_openai_service.py` - Unit tests for OpenAI service.

### Existing Files Modified
- `frontend/src/components/CanvasDisplay.tsx` - Enhanced with advanced mask tools and export functionality.
- `frontend/src/hooks/useCanvas.ts` - Extended with undo/redo, advanced drawing tools, and mask export.
- `frontend/src/pages/HomePage.tsx` - Integration of new components into complete workflow.
- `frontend/src/services/apiClient.ts` - Added functions for OpenAI integration endpoints.
- `backend/app/main.py` - Include new OpenAI integration router.
- `backend/app/core/config.py` - Add OpenAI API key configuration.
- `backend/requirements.txt` - Add OpenAI Python SDK and related dependencies.
- `DEVELOPMENT.md` - Document OPENAI_API_KEY configuration.
- `frontend/package.json` - Add any required frontend dependencies for enhanced UI.
- `.project-management/current-prd/tasks-prd-core-functionality-epic.md` - Task tracking updates.
- `CHANGELOG.md` - Document Phase 2 implementation progress.

### Notes
- OpenAI API key must be stored securely in environment variables
- Consider implementing request queuing to manage API rate limits
- Ensure proper error handling for all OpenAI API failure scenarios
- Test with various image sizes and formats to ensure compatibility
- Implement comprehensive logging for debugging API interactions

## Tasks

- [ ] 1.0 Set Up OpenAI Integration Foundation (FR1, FR4, FR5)
  - [x] 1.1 Add OpenAI Python SDK to `backend/requirements.txt`
  - [x] 1.2 Update `backend/app/core/config.py` to include OpenAI API key from environment
  - [x] 1.3 Create `backend/services/openai_service.py` with basic API client setup
  - [ ] 1.4 Add proper logging configuration for OpenAI API requests and responses
  - [x] 1.5 Create unit tests for OpenAI service configuration and connection
  - [x] 1.6 Update environment setup documentation for API key requirements

- [ ] 2.0 Implement Core OpenAI Image Editing Integration (FR1, FR2, FR3)
  - [ ] 2.1 Implement image editing function in `openai_service.py` using OpenAI SDK
  - [ ] 2.2 Add proper image format conversion (canvas to PNG) for OpenAI compatibility
  - [ ] 2.3 Handle OpenAI API responses including success, error, and timeout scenarios
  - [ ] 2.4 Implement request/response validation and error mapping
  - [ ] 2.5 Add comprehensive unit tests for OpenAI service functions
  - [ ] 2.6 Test integration with various image sizes and mask complexities

- [ ] 3.0 Create OpenAI API Endpoints (FR1-FR5, US5, US7)
  - [ ] 3.1 Create `backend/app/api/v1/endpoints/openai_integration.py`
  - [ ] 3.2 Implement `POST /api/v1/images/edit` endpoint for OpenAI image editing
  - [ ] 3.3 Implement `GET /api/v1/images/status/{request_id}` for progress tracking
  - [ ] 3.4 Add proper request validation for image, mask, and prompt data
  - [ ] 3.5 Implement async processing for long-running OpenAI requests
  - [ ] 3.6 Add comprehensive error handling and status code mapping
  - [ ] 3.7 Include the new OpenAI router in `backend/app/main.py`
  - [ ] 3.8 Create unit tests for all OpenAI integration endpoints

- [ ] 4.0 Enhance Mask Drawing System (FR6-FR10, US2, US6)
  - [ ] 4.1 Create `MaskToolbar.tsx` component with brush size controls (small, medium, large)
  - [ ] 4.2 Implement rectangle and circle selection tools in addition to freehand drawing
  - [ ] 4.3 Add "Clear Mask" functionality to reset the entire mask
  - [ ] 4.4 Implement undo/redo system for mask operations
  - [ ] 4.5 Enhance `useCanvas.ts` hook with advanced drawing state management
  - [ ] 4.6 Add mask export functionality to generate proper PNG data for API
  - [ ] 4.7 Update `CanvasDisplay.tsx` to integrate with new toolbar and tools
  - [ ] 4.8 Create comprehensive unit tests for enhanced mask functionality

- [ ] 5.0 Implement Prompt Engineering Interface (FR11-FR14, US1, US4)
  - [ ] 5.1 Create `PromptInput.tsx` component with text area and validation
  - [ ] 5.2 Add prompt length validation and character counter
  - [ ] 5.3 Implement recent prompts storage and quick reuse functionality
  - [ ] 5.4 Add example prompts and guidance text for new users
  - [ ] 5.5 Include prompt suggestions based on common editing tasks
  - [ ] 5.6 Create unit tests for prompt input validation and storage

- [ ] 6.0 Build Results Display System (FR15-FR18, US3)
  - [ ] 6.1 Create `ResultsDisplay.tsx` component for before/after comparison
  - [ ] 6.2 Implement side-by-side and overlay comparison modes
  - [ ] 6.3 Add download/save functionality for edited results
  - [ ] 6.4 Handle display of OpenAI error responses and fallback states
  - [ ] 6.5 Optimize image loading and display performance
  - [ ] 6.6 Create unit tests for results display functionality

- [ ] 7.0 Implement Progress and Error Handling (FR19-FR22, US5, US7)
  - [ ] 7.1 Create `ProgressIndicator.tsx` component with loading animations
  - [ ] 7.2 Implement progress tracking for long-running API requests
  - [ ] 7.3 Add estimated completion time display
  - [ ] 7.4 Create `ErrorBoundary.tsx` for graceful error recovery
  - [ ] 7.5 Implement retry functionality for failed requests
  - [ ] 7.6 Add user-friendly error messages for different failure scenarios
  - [ ] 7.7 Create unit tests for progress and error handling components

- [ ] 8.0 Frontend-Backend Integration for Complete Workflow (FR1-FR22, US1-US7)
  - [ ] 8.1 Update `frontend/src/services/apiClient.ts` with OpenAI integration functions
  - [ ] 8.2 Connect `PromptInput.tsx` to validation and submission workflow
  - [ ] 8.3 Integrate enhanced `CanvasDisplay.tsx` with mask export for API submission
  - [ ] 8.4 Connect `ResultsDisplay.tsx` to receive and display API responses
  - [ ] 8.5 Implement complete edit workflow in `HomePage.tsx`
  - [ ] 8.6 Add proper loading states and error handling throughout the UI
  - [ ] 8.7 Test end-to-end functionality with real OpenAI API calls

- [ ] 9.0 Performance Optimization and Polish (SM1-SM7)
  - [ ] 9.1 Optimize canvas operations for smooth mask drawing performance
  - [ ] 9.2 Implement image compression for large uploads to meet OpenAI size limits
  - [ ] 9.3 Add client-side validation for image dimensions and format compatibility
  - [ ] 9.4 Optimize memory usage for large images and long editing sessions
  - [ ] 9.5 Test performance across different browsers and devices
  - [ ] 9.6 Add performance monitoring and logging for optimization

- [ ] 10.0 Testing and Documentation for Phase 2 Completion (SM6, SM7)
  - [ ] 10.1 Create comprehensive integration tests for the complete editing workflow
  - [ ] 10.2 Test error scenarios including API failures, network issues, and invalid inputs
  - [ ] 10.3 Verify all functional requirements (FR1-FR22) through manual testing
  - [ ] 10.4 Add JSDoc comments to all new frontend components and hooks
  - [ ] 10.5 Add docstrings to all new backend modules and functions
  - [ ] 10.6 Update `CHANGELOG.md` with Phase 2 implementation summary
  - [ ] 10.7 Create user guide documentation for the complete editing workflow
  - [ ] 10.8 Test that Kevin's son can independently use the full system
