# PRD: Core Functionality Epic (Phase 2)

## 1. Introduction/Overview

This PRD defines Phase 2 of the Shiny-Broccoli AI image editing application: the Core Functionality Epic. Building on the completed Foundation Epic (Phase 1), this phase implements the actual OpenAI integration for image editing, enhances the mask drawing system, and creates a complete workflow for displaying edited results. The goal is to achieve the full end-to-end image editing experience where users can upload images, draw sophisticated masks, send them to OpenAI with prompts, and view the edited results.

## 2. Goals

- **G1**: Integrate OpenAI's image editing API to process user images with masks and prompts
- **G2**: Enhance the mask drawing system with advanced tools and precision controls
- **G3**: Implement a results display system that shows before/after comparisons
- **G4**: Create a complete prompt engineering interface for iterative editing
- **G5**: Establish proper error handling and progress feedback for API calls
- **G6**: Optimize the user experience for rapid iteration and experimentation

## 3. User Stories

- **US1**: As a learner, I want to enter text prompts describing how I want my image edited so that I can see how language affects AI output
- **US2**: As a learner, I want to draw precise masks over specific areas of my image so that I can control exactly what gets edited
- **US3**: As a learner, I want to see the edited result alongside my original image so that I can understand what changed
- **US4**: As a learner, I want to quickly try different prompts on the same mask so that I can experiment with prompt engineering
- **US5**: As a learner, I want clear feedback when the AI is processing my request so that I understand the system is working
- **US6**: As a mentor, I want to demonstrate advanced masking techniques so that I can teach precision and control
- **US7**: As a developer, I want proper error handling for API failures so that I can troubleshoot issues effectively

## 4. Functional Requirements

**OpenAI Integration Requirements:**
1. **FR1**: The system must integrate with OpenAI's image editing API endpoint
2. **FR2**: The system must send multipart requests containing original image, mask image, and text prompt
3. **FR3**: The system must handle OpenAI API responses including success cases and various error conditions
4. **FR4**: The system must securely manage the OpenAI API key through environment variables
5. **FR5**: The system must implement proper request/response logging for debugging and learning

**Enhanced Mask Drawing Requirements:**
6. **FR6**: The system must provide multiple brush sizes for mask drawing (small, medium, large)
7. **FR7**: The system must support rectangle and circle selection tools in addition to freehand drawing
8. **FR8**: The system must allow users to clear the entire mask and start over
9. **FR9**: The system must provide an undo/redo system for mask operations
10. **FR10**: The system must export masks as proper image data (PNG format) for API submission

**Prompt Interface Requirements:**
11. **FR11**: The system must provide a text input area for entering editing prompts
12. **FR12**: The system must validate prompt input for reasonable length and content
13. **FR13**: The system must save recent prompts for quick reuse and experimentation
14. **FR14**: The system must provide example prompts to guide new users

**Results Display Requirements:**
15. **FR15**: The system must display the edited result image returned from OpenAI
16. **FR16**: The system must show before/after comparison views (original vs edited)
17. **FR17**: The system must allow users to save/download the edited result
18. **FR18**: The system must handle cases where OpenAI returns errors or no result

**Progress and Error Handling Requirements:**
19. **FR19**: The system must show loading indicators during API processing (which can take 10-30 seconds)
20. **FR20**: The system must display progress updates and estimated completion times
21. **FR21**: The system must handle network timeouts and API rate limits gracefully
22. **FR22**: The system must provide clear error messages for different failure scenarios

## 5. Non-Goals (Out of Scope)

- **NG1**: No image generation (text-to-image) - only image editing with masks
- **NG2**: No batch processing of multiple images
- **NG3**: No advanced image transformations beyond OpenAI editing
- **NG4**: No persistent storage of results or editing history
- **NG5**: No collaborative editing or sharing features
- **NG6**: No mobile app or responsive design optimization
- **NG7**: No integration with other AI providers beyond OpenAI
- **NG8**: No advanced masking algorithms (content-aware selection, etc.)

## 6. Design Considerations

- **API Integration**: Use OpenAI's official Python SDK for reliable and well-documented integration
- **Mask Precision**: Implement pixel-perfect mask drawing with anti-aliasing for smooth edges
- **Progress UX**: Provide engaging progress indicators since API calls can take 10-30 seconds
- **Error Recovery**: Allow users to easily retry failed requests without losing their work
- **Prompt Engineering**: Include helpful examples and guidance for effective prompt writing
- **Performance**: Optimize mask generation and image handling for responsive interactions

## 7. Technical Considerations

- **API Key Security**: Store OpenAI key in environment variables, never in code or client-side
- **Image Processing**: Convert canvas masks to proper PNG format for OpenAI API compatibility
- **Memory Management**: Handle large images and results efficiently to prevent browser crashes
- **Async Operations**: Use proper async/await patterns for long-running API calls
- **Rate Limiting**: Implement client-side throttling to avoid API abuse
- **Browser Compatibility**: Ensure mask drawing works consistently across modern browsers

## 8. Success Metrics

- **SM1**: Users can successfully complete end-to-end image edits using OpenAI API
- **SM2**: Mask drawing tools provide sufficient precision for detailed selections
- **SM3**: API response times are acceptable (under 45 seconds for typical requests)
- **SM4**: Error conditions are handled gracefully with helpful user guidance
- **SM5**: Before/after comparisons clearly show the effects of edits
- **SM6**: Kevin's son can independently create and iterate on prompts
- **SM7**: The system handles at least 90% of typical use cases without errors

## 9. API Specifications

### Updated Backend Endpoints

**POST /api/v1/images/edit**
- **Purpose**: Send image, mask, and prompt to OpenAI for editing
- **Request**: multipart/form-data with 'image', 'mask', and 'prompt' fields
- **Response**: `{"success": true, "edited_image_url": "data:image/png;base64,...", "request_id": "uuid"}`
- **Error Cases**: 400 for invalid input, 401 for API key issues, 429 for rate limits, 500 for OpenAI errors

**GET /api/v1/images/status/{request_id}**
- **Purpose**: Check the status of a long-running edit request
- **Response**: `{"status": "processing|completed|failed", "progress": 0.75, "estimated_seconds": 15}`

### Frontend API Integration

**Edit Workflow**:
1. User uploads image → displays in canvas (existing functionality)
2. User draws mask → validates mask data
3. User enters prompt → validates prompt text
4. User submits → POST to /images/edit with all data
5. Frontend polls status or waits for completion
6. Display result in before/after view

## 10. OpenAI Integration Specifications

**API Endpoint**: `https://api.openai.com/v1/images/edits`
**Required Parameters**:
- `image`: The original image file (PNG format, max 4MB)
- `mask`: The mask image (PNG format, same dimensions as image)
- `prompt`: Text description of desired edit (max 1000 characters)
- `n`: Number of images to generate (default: 1)
- `size`: Output size - "256x256", "512x512", or "1024x1024"

**Response Format**:
```json
{
  "created": 1589478378,
  "data": [
    {
      "url": "https://...",
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

## 11. Enhanced UI Components

**New Components to Implement**:
- `PromptInput.tsx` - Text area with validation and example prompts
- `MaskToolbar.tsx` - Advanced drawing tools (brush sizes, shapes, undo/redo)
- `ResultsDisplay.tsx` - Before/after image comparison
- `ProgressIndicator.tsx` - Loading states and progress feedback
- `ErrorBoundary.tsx` - Graceful error handling and recovery

**Enhanced Components**:
- `CanvasDisplay.tsx` - Add advanced mask tools and export functionality
- `HomePage.tsx` - Integrate new components into complete workflow

## 12. Open Questions

- **OQ1**: Should we implement request queuing for multiple edit attempts or process one at a time?
- **OQ2**: What's the optimal image size to send to OpenAI for best quality vs speed tradeoff?
- **OQ3**: Should we implement client-side image compression before sending to API?
- **OQ4**: How should we handle very long API response times (>60 seconds)?
- **OQ5**: Should we cache recent results to avoid redundant API calls?

## 13. Dependencies & Assumptions

**Dependencies**:
- Completed Phase 1 (Foundation Epic) with working file upload and basic canvas
- Valid OpenAI API key with sufficient credits for testing
- OpenAI Python SDK or direct HTTP client for API integration
- Stable internet connection for API calls

**Assumptions**:
- OpenAI API will remain stable and compatible during development
- Users will primarily edit images suitable for OpenAI's constraints (max 4MB, square aspect ratios work best)
- API response times will typically be 10-30 seconds for standard requests
- Users understand that each edit consumes API credits/costs

## 14. Phase Completion Criteria

This phase is considered complete when:
1. ✅ All functional requirements (FR1-FR22) are implemented and tested
2. ✅ OpenAI API integration works reliably for typical use cases
3. ✅ Enhanced mask drawing tools provide sufficient precision and control
4. ✅ Before/after results display clearly shows edit effects
5. ✅ Error handling covers all major failure scenarios with helpful messages
6. ✅ Performance is acceptable for interactive use (no blocking UI operations)
7. ✅ Kevin's son can complete the full workflow independently
8. ✅ Code is properly documented with clear examples for learning
9. ✅ Integration tests demonstrate reliable end-to-end functionality
10. ✅ The system is ready for Phase 3 (Polish & Learning) enhancements

## 15. Referenced Files

- **Full PRD**: `/Users/kevinsullivan/code/shiny-broccoli/.project-management/closed-prd/prd-background/full-prd.md` - Overall project vision and phase definitions
- **Phase 1 PRD**: `/Users/kevinsullivan/code/shiny-broccoli/.project-management/closed-prd/prd-foundation-epic.md` - Completed foundation that this phase builds upon
- **Design Mock**: `/Users/kevinsullivan/code/shiny-broccoli/.project-management/closed-prd/prd-background/design-mock.html` - UI reference for enhanced components
- **OpenAI API Docs**: https://platform.openai.com/docs/api-reference/images/createEdit - Official API documentation

## 16. Risk Mitigation

**High-Priority Risks**:
1. **OpenAI API Rate Limits/Costs** - Implement usage tracking and user guidance
2. **Large Image Processing** - Add client-side compression and size validation
3. **Network Timeouts** - Implement robust retry logic and user feedback
4. **Mask Quality Issues** - Provide clear guidance on effective masking techniques
5. **API Key Exposure** - Ensure secure key management and rotation procedures

**Medium-Priority Risks**:
1. **Browser Performance** - Optimize canvas operations and memory usage
2. **User Experience Confusion** - Provide clear instructions and examples
3. **Error Recovery** - Allow easy retry without losing work
