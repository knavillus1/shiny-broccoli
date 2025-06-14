# PRD: Backend Hardening Epic

## 1. Introduction/Overview

The Shiny Broccoli backend application requires comprehensive hardening to improve maintainability, testability, performance, and production readiness. Currently, the backend has several technical debt issues including custom configuration management, tight coupling between services, synchronous I/O operations in async contexts, in-memory state management, poor observability, and insufficient error handling.

This epic addresses fundamental architectural and infrastructure concerns to transform the backend into a production-ready, maintainable system that follows FastAPI and Python best practices.

## 2. Goals

- **G1**: Replace custom configuration with industry-standard pydantic-settings for better environment variable management
- **G2**: Implement proper dependency injection using FastAPI's Depends system for improved testability
- **G3**: Optimize async performance by moving blocking I/O operations to thread pools
- **G4**: Establish durable persistence layer with repository pattern abstraction
- **G5**: Reorganize API structure following domain-driven design principles
- **G6**: Standardize error handling with RFC 7807 Problem Details
- **G7**: Implement structured logging with request correlation for better observability
- **G8**: Improve project organization separating concerns properly
- **G9**: Remove dead code and improve overall code quality

## 3. User Stories

**As a DevOps engineer**, I want structured JSON logs with correlation IDs so that I can efficiently debug issues across distributed requests.

**As a backend developer**, I want dependency injection so that I can easily write unit tests with mocked services without complex setup.

**As a system administrator**, I want environment-based configuration so that I can deploy the same code across different environments (dev, staging, prod) with different settings.

**As an API consumer**, I want consistent error responses following RFC 7807 so that I can reliably parse and handle errors in my client application.

**As a site reliability engineer**, I want persistent task storage so that long-running operations survive server restarts and can be monitored across instances.

**As a product manager**, I want responsive API endpoints so that users don't experience timeouts during image processing operations.

**As a software architect**, I want clean separation of concerns so that the codebase is maintainable and new developers can quickly understand the system structure.

## 4. Functional Requirements

### Configuration Management (F1)
- **F1.1**: Replace `backend/app/core/config.py` custom dataclass with `pydantic_settings.BaseSettings`
- **F1.2**: Support automatic .env file loading for local development
- **F1.3**: Support environment variable overrides for production deployment
- **F1.4**: Maintain backward compatibility with existing environment variable names

### Dependency Injection (F2)
- **F2.1**: Create dependency injection setup for OpenAIService using FastAPI's Depends
- **F2.2**: Create dependency injection setup for TaskRepository using FastAPI's Depends
- **F2.3**: Create dependency injection setup for ImageProcessor using FastAPI's Depends
- **F2.4**: Modify all endpoint handlers to use injected dependencies instead of direct instantiation

### Async Performance Optimization (F3)
- **F3.1**: Move PIL/Pillow image processing operations to ThreadPoolExecutor using `run_in_executor`
- **F3.2**: Ensure PNG conversion doesn't block the event loop
- **F3.3**: Maintain existing API contracts while improving performance

### Persistence Layer (F4)
- **F4.1**: Create abstract TaskRepository interface
- **F4.2**: Implement InMemoryTaskRepository for testing
- **F4.3**: Implement Redis-based TaskRepository using redis-py
- **F4.4**: Implement SQLite-based TaskRepository using SQLModel (optional)
- **F4.5**: Configure repository selection via environment variables

### API Organization (F5)
- **F5.1**: Move `backend/app/api/v1/endpoints/*.py` to `backend/app/api/v1/routers/*.py`
- **F5.2**: Group endpoints by domain: `images.py`, `health.py`, `tasks.py`
- **F5.3**: Update import statements in main.py to use new router structure

### Error Handling (F6)
- **F6.1**: Create standardized error response models following RFC 7807 Problem Details
- **F6.2**: Replace raw OpenAI API errors with sanitized problem detail responses
- **F6.3**: Implement global exception handler for HTTPException conversion
- **F6.4**: Add validation error handling with proper problem details format

### Observability (F7)
- **F7.1**: Replace basic logging with structlog for structured JSON output
- **F7.2**: Implement X-Request-ID middleware for request correlation
- **F7.3**: Add request/response logging with configurable log levels
- **F7.4**: Include performance metrics in structured logs

### Project Organization (F8)
- **F8.1**: Separate infrastructure concerns from business logic
- **F8.2**: Move domain services out of mixed infrastructure directories
- **F8.3**: Establish clear boundaries between API, services, and core layers

### Code Quality (F9)
- **F9.1**: Remove unused `chat_storage.py` file
- **F9.2**: Remove unused `verify_connection()` method
- **F9.3**: Clean up empty `__init__.py` files where appropriate
- **F9.4**: Remove pragma: no cover statements that will never execute

## 5. Non-Goals (Out of Scope)

- **NG1**: Authentication and authorization implementation (future epic)
- **NG2**: Rate limiting implementation (future epic)  
- **NG3**: Request body size limits (future epic)
- **NG4**: File scanning/virus detection (future epic)
- **NG5**: API versioning strategy changes
- **NG6**: Database migration system (if using SQLite option)
- **NG7**: Monitoring and alerting setup (infrastructure concern)
- **NG8**: Load balancing considerations
- **NG9**: Caching strategies beyond basic task storage

## 6. Design Considerations

### Configuration
- Use pydantic-settings validation features for type safety
- Leverage nested configuration models for organized settings
- Support both .env files and direct environment variables
- Provide sensible defaults for development environments

### Dependency Injection
- Follow FastAPI's dependency injection patterns
- Use dependency_overrides for testing scenarios
- Create factory functions for complex service initialization
- Ensure singleton behavior where appropriate (e.g., database connections)

### Repository Pattern
- Abstract persistence behind repository interfaces
- Enable easy switching between storage backends
- Support both sync and async repository implementations
- Provide clear migration path from current in-memory system

### Structured Logging
- Use correlation IDs for request tracing
- Include performance metrics (response time, etc.)
- Support multiple output formats (JSON for production, human-readable for development)
- Integrate with existing FastAPI request/response lifecycle

## 7. Technical Considerations

### Dependencies
- pydantic-settings: Already included in requirements.txt
- structlog: New dependency for structured logging  
- redis-py: New dependency for Redis persistence option
- sqlmodel: New dependency for SQLite persistence option (optional)

### Migration Strategy
- Implement changes incrementally to maintain system stability
- Use feature flags or environment variables to enable new implementations
- Maintain backward compatibility during transition period
- Provide clear documentation for deployment configuration changes

### Testing Strategy
- Update existing tests to use new dependency injection system
- Create integration tests for persistence layer implementations
- Add performance tests for async optimization improvements
- Maintain test coverage during refactoring

### Performance Impact
- PNG processing optimization should improve response times
- Repository abstraction may introduce minimal overhead
- Structured logging may increase memory usage but improve debugging
- Dependency injection should have negligible performance impact

## 8. Success Metrics

- **M1**: PNG processing operations complete without blocking event loop (measured via async profiling)
- **M2**: All existing tests pass with new dependency injection system (100% test compatibility)
- **M3**: Task persistence survives server restarts (demonstrated via integration tests)
- **M4**: Request correlation IDs appear in all log entries (100% log entry coverage)
- **M5**: Error responses follow RFC 7807 format (validated via API contract tests)
- **M6**: Configuration can be modified via environment variables without code changes
- **M7**: Development setup time reduced (documented setup process under 5 minutes)
- **M8**: Code coverage maintains or improves current levels after dead code removal

## 9. Open Questions

- **Q1**: Should we implement both Redis and SQLite persistence options, or choose one?
- **Q2**: What's the preferred log aggregation system for structured log consumption?
- **Q3**: Should we maintain the existing endpoint URL structure during router reorganization?
- **Q4**: What's the deployment timeline for rolling out persistence layer changes?
- **Q5**: Are there any specific structured logging fields required for existing monitoring systems?
- **Q6**: Should we implement async repository interfaces or keep them synchronous for simplicity?
- **Q7**: What's the priority order for implementing these changes to minimize disruption?

## Implementation Priority

### Phase 1: Foundation (Low Risk)
1. Configuration management (F1)
2. Code cleanup (F9)
3. API organization (F5)

### Phase 2: Core Architecture (Medium Risk)  
1. Dependency injection (F2)
2. Error handling (F6)
3. Observability (F7)

### Phase 3: Performance & Persistence (Higher Risk)
1. Async optimization (F3)
2. Persistence layer (F4)
3. Project organization (F8)

This phased approach allows for incremental validation and reduces the risk of introducing breaking changes while delivering value throughout the implementation process.
