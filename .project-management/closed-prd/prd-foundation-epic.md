# PRD: Foundation Epic (Phase 1)

## 1. Introduction/Overview

This PRD defines Phase 1 of the Shiny-Broccoli AI image editing application: the Foundation Epic. Building on the completed project initialization, this phase establishes the core file upload functionality, basic canvas drawing interface, and FastAPI backend stub for image processing. The goal is to create a working foundation where users can upload images, see them displayed in a canvas, draw basic shapes, and have the frontend communicate with a backend endpoint (even if the actual OpenAI integration is stubbed out).

## 2. Goals

- **G1**: Implement file upload functionality that accepts image files and displays them in the frontend
- **G2**: Create a canvas-based interface where users can draw masks over uploaded images
- **G3**: Build FastAPI endpoints to receive image and mask data from the frontend
- **G4**: Establish the complete frontend-to-backend communication flow for image editing workflow
- **G5**: Create a foundation for the mask drawing system that can be extended in Phase 2
- **G6**: Ensure the UI follows the design direction from the design mock while remaining functional

## 3. User Stories

- **US1**: As a learner, I want to upload an image file so that I can see it displayed in the application
- **US2**: As a learner, I want to draw simple shapes on the uploaded image so that I can understand how masking works
- **US3**: As a learner, I want to see visual feedback when I interact with the canvas so that I understand what areas I'm selecting
- **US4**: As a developer, I want the frontend to successfully send image data to the backend so that I can verify the communication pipeline
- **US5**: As a mentor, I want clear visual indicators of upload progress and canvas interactions so that I can demonstrate the workflow effectively

## 4. Functional Requirements

**File Upload Requirements:**
1. **FR1**: The system must provide a file upload interface that accepts common image formats (JPEG, PNG, GIF, WebP)
2. **FR2**: The system must validate uploaded files for type and reasonable size limits (max 10MB initially)
3. **FR3**: The system must display upload progress and success/error states clearly to the user
4. **FR4**: The system must display the uploaded image in a canvas element for further interaction

**Canvas & Drawing Requirements:**
5. **FR5**: The system must render uploaded images in an HTML5 canvas element with proper scaling
6. **FR6**: The system must provide basic drawing tools for creating mask areas (at minimum: brush/pen tool)
7. **FR7**: The system must allow users to toggle between drawing and erasing modes
8. **FR8**: The system must provide visual feedback during drawing operations (cursor changes, stroke preview)
9. **FR9**: The system must maintain the drawn mask as a separate layer that can be toggled on/off for visibility

**Backend API Requirements:**
10. **FR10**: The system must provide a POST endpoint to receive multipart form data (image + mask data)
11. **FR11**: The system must validate incoming image files on the backend for security and format compliance
12. **FR12**: The system must return a structured response indicating successful receipt of image data
13. **FR13**: The system must include proper error handling for malformed requests or unsupported file types
14. **FR14**: The system must log incoming requests and processing times for debugging purposes

**Integration Requirements:**
15. **FR15**: The frontend must successfully communicate with the backend API using proper HTTP methods and content types
16. **FR16**: The system must handle network errors and timeouts gracefully with user-friendly error messages
17. **FR17**: The system must provide a "Submit" workflow that sends both original image and mask data to the backend

## 5. Non-Goals (Out of Scope)

- **NG1**: No actual OpenAI API integration (Phase 2 scope)
- **NG2**: No advanced drawing tools (layers, complex brushes, filters)
- **NG3**: No image editing or transformation beyond display and masking
- **NG4**: No persistent storage of images or masks (in-memory/session only)
- **NG5**: No user authentication or session management
- **NG6**: No real-time collaboration features
- **NG7**: No mobile responsiveness optimization (desktop focus)

## 6. Design Considerations

- **Canvas Implementation**: Use HTML5 Canvas API directly rather than heavy libraries for this phase, with consideration for future Fabric.js integration
- **File Handling**: Use standard File API and FormData for uploads, ensuring compatibility with multipart backend processing
- **UI Layout**: Follow the design mock structure with upload area, canvas workspace, and basic controls clearly separated
- **Drawing UX**: Provide immediate visual feedback for all drawing operations to maintain user engagement
- **Error Handling**: Clear, actionable error messages that help users understand what went wrong and how to fix it

## 7. Technical Considerations

- **Canvas Sizing**: Implement responsive canvas sizing that maintains image aspect ratios while fitting available space
- **File Upload**: Use chunked or progress-tracking uploads for larger images to provide better user feedback
- **Memory Management**: Properly dispose of canvas contexts and image data to prevent memory leaks during multiple uploads
- **API Design**: Structure backend endpoints to easily extend for OpenAI integration in Phase 2
- **Drawing Performance**: Optimize canvas drawing operations for smooth interaction, especially on lower-end hardware
- **Browser Compatibility**: Ensure functionality works across modern browsers (Chrome, Firefox, Safari, Edge)

## 8. Success Metrics

- **SM1**: Users can successfully upload images of various formats and sizes (up to 10MB) without errors
- **SM2**: Uploaded images display correctly in the canvas with proper aspect ratio and sizing
- **SM3**: Users can draw visible mask areas on uploaded images with smooth, responsive interaction
- **SM4**: Frontend successfully sends image and mask data to backend and receives confirmation responses
- **SM5**: Error conditions (invalid files, network issues) are handled gracefully with clear user feedback
- **SM6**: The drawing interface is intuitive enough for Kevin's son to use without extensive instruction
- **SM7**: Upload and drawing operations complete within reasonable time limits (< 3 seconds for typical images)

## 9. API Specifications

### Backend Endpoints

**POST /api/v1/images/upload**
- **Purpose**: Receive and validate uploaded image files
- **Request**: multipart/form-data with 'image' field
- **Response**: `{"success": true, "image_id": "temp_id", "dimensions": {"width": 1024, "height": 768}}`
- **Error Cases**: 400 for invalid files, 413 for oversized files, 500 for processing errors

**POST /api/v1/images/process**
- **Purpose**: Receive image and mask data for processing (stubbed response in this phase)
- **Request**: multipart/form-data with 'image' and 'mask' fields, optional 'prompt' text field
- **Response**: `{"success": true, "message": "Image processing request received", "request_id": "stub_id"}`
- **Error Cases**: 400 for missing fields, 422 for invalid data format

### Frontend API Integration

**Upload Flow**:
1. User selects file → Frontend validates client-side → POST to /images/upload
2. Backend validates and responds → Frontend displays image in canvas
3. User draws mask → Frontend captures mask data
4. User submits → Frontend sends both original and mask to /images/process

## 10. Open Questions

- **OQ1**: Should we implement basic zoom/pan functionality for the canvas in this phase or defer to Phase 2?
- **OQ2**: What specific drawing tools should be included? (brush only, or also rectangle/circle selection?)
- **OQ3**: Should mask data be sent as image data (PNG) or as vector path data (more efficient)?
- **OQ4**: How should we handle very large images that might not fit comfortably in the canvas viewport?
- **OQ5**: Should the backend return any placeholder/mock edited image in this phase to test the full pipeline?

## 11. Dependencies & Assumptions

**Dependencies**:
- Completed Phase 0 (Project Initialization) with working React + FastAPI foundation
- HTML5 Canvas API support in target browsers
- Standard File API support for file uploads

**Assumptions**:
- Users will primarily upload reasonably sized images (under 10MB, typical photo dimensions)
- Drawing interactions will be mouse-based (desktop focus)
- Network connectivity is stable for API calls
- Images will be in standard web formats (JPEG, PNG, GIF, WebP)

## 12. Phase Completion Criteria

This phase is considered complete when:
1. ✅ All functional requirements (FR1-FR17) are implemented and tested
2. ✅ All success metrics (SM1-SM7) are verified through manual testing
3. ✅ API endpoints respond correctly to valid and invalid requests
4. ✅ Error handling provides clear, actionable feedback to users
5. ✅ Code is properly documented and follows established project conventions
6. ✅ Integration tests demonstrate successful frontend-backend communication
7. ✅ The foundation is ready for Phase 2 OpenAI integration without major refactoring

## 13. Referenced Files

- **Full PRD**: `/Users/kevinsullivan/code/shiny-broccoli/.project-management/closed-prd/prd-background/full-prd.md` - Provides overall project vision and phase definitions
- **Design Mock**: `/Users/kevinsullivan/code/shiny-broccoli/.project-management/closed-prd/prd-background/design-mock.html` - Visual reference for UI layout and component structure
- **Project Initialization**: `/Users/kevinsullivan/code/shiny-broccoli/.project-management/closed-prd/prd-project-initialization.md` - Completed foundation that this phase builds upon
