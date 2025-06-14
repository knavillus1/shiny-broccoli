# Tasks: Backend Hardening Epic

## Pre-Feature Development Project Tree

```
shiny-broccoli/
├── README.md
├── CHANGELOG.md  
├── DEVELOPMENT.md
├── LICENSE
├── dev_init.sh
├── run_tests.sh
├── generate_docs.py
├── mask.png
├── docs/
│   └── user_guide.md
├── backend/
│   ├── requirements.txt
│   ├── start.sh
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── logging.py
│   │   ├── middleware.py
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           ├── health.py
│   │   │           ├── images.py
│   │   │           └── openai_integration.py
│   │   └── core/
│   │       ├── __init__.py
│   │       └── config.py
│   ├── services/
│   │   ├── chat_storage.py
│   │   ├── image_processor.py  
│   │   ├── openai_service.py
│   │   └── task_manager.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── integration/
│       └── unit/
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── components/
        ├── hooks/
        ├── pages/
        └── services/
```

## Relevant Files

### Proposed New Files
- `backend/app/core/settings.py` - New pydantic-settings based configuration
- `backend/app/core/dependencies.py` - Dependency injection setup for FastAPI
- `backend/app/core/errors.py` - RFC 7807 Problem Details error models
- `backend/app/core/logging.py` - Structured logging configuration
- `backend/app/middleware/correlation.py` - Request correlation ID middleware  
- `backend/app/api/v1/routers/health.py` - Reorganized health endpoints
- `backend/app/api/v1/routers/images.py` - Reorganized image endpoints
- `backend/app/api/v1/routers/tasks.py` - New task status endpoints
- `backend/repositories/__init__.py` - Repository pattern interfaces
- `backend/repositories/task_repository.py` - Abstract task repository interface
- `backend/repositories/memory_task_repository.py` - In-memory implementation
- `backend/repositories/redis_task_repository.py` - Redis persistence implementation
- `backend/services/async_image_processor.py` - Thread-pool optimized image processor
- `backend/.env.example` - Environment configuration template

### Proposed New Test Files
- `backend/tests/unit/core/test_settings.py` - Test new configuration system
- `backend/tests/unit/core/test_dependencies.py` - Test dependency injection
- `backend/tests/unit/core/test_errors.py` - Test error handling
- `backend/tests/unit/repositories/test_task_repositories.py` - Test repository implementations
- `backend/tests/unit/services/test_async_image_processor.py` - Test async image processing
- `backend/tests/integration/test_persistence.py` - Test persistence layer
- `backend/tests/integration/test_logging.py` - Test structured logging

### Existing Files Modified
- `backend/app/core/config.py` - Remove custom Settings, update imports
- `backend/app/main.py` - Update to use new dependencies and routers
- `backend/app/logging.py` - Replace with structured logging setup
- `backend/app/middleware.py` - Add correlation middleware
- `backend/services/openai_service.py` - Update to use async image processing
- `backend/services/task_manager.py` - Replace with repository pattern
- `backend/requirements.txt` - Add structlog, redis-py dependencies
- `backend/tests/conftest.py` - Update for new dependency injection
- `backend/app/api/v1/endpoints/openai_integration.py` - Update to use dependency injection
- `.flake8` - Exclude docs generator from linting
- `backend/services/chat_storage.py` - **Removed unused chat history storage**
- `backend/app/core/__init__.py` - **Removed empty module file**
- `backend/tests/integration/test_openai_connectivity.py` - **Removed obsolete verify_connection test**
- `backend/tests/unit/services/test_openai_service.py` - Updated for removed verify_connection

### Notes

- **Development Environment**: `dev_init.sh` may need updates for Redis setup if persistence option is chosen
- **Dependencies**: New packages required: `structlog`, `redis-py` (optional), `sqlmodel` (optional)
- **RFC 7807**: Problem Details for HTTP APIs standard for consistent error responses
- **Correlation IDs**: Enable request tracing across distributed systems for better debugging
- **Repository Pattern**: Abstracts persistence implementation, enabling easy testing and backend switching
- **Thread Pool**: Prevents blocking the async event loop during CPU-intensive image processing

## Tasks

- [x] 1.0 Implement Pydantic Settings Configuration Management
  - [x] 1.1 Create `backend/app/core/settings.py` with `BaseSettings` class extending pydantic-settings
  - [x] 1.2 Define environment variables for `openai_api_key`, `allow_origins`, `log_level`, `redis_url` (optional)
  - [x] 1.3 Add support for `.env` file loading with `_env_file = ".env"` setting
  - [x] 1.4 Create `backend/.env.example` template with all configuration variables documented
  - [x] 1.5 Update `backend/app/core/config.py` to use new Settings class and maintain `get_settings()` function
  - [x] 1.6 Test configuration loading from environment variables and .env file
  - [x] 1.7 Update all imports throughout codebase to use new settings module

- [x] 2.0 Establish Dependency Injection System
  - [x] 2.1 Create `backend/app/core/dependencies.py` with dependency provider functions
  - [x] 2.2 Implement `get_openai_service()` dependency function using `Depends(get_settings)`
  - [x] 2.3 Implement `get_task_repository()` dependency function with repository selection logic
  - [x] 2.4 Implement `get_image_processor()` dependency function for async image processing
  - [x] 2.5 Update all endpoint handlers to accept dependencies via `Depends()` instead of direct instantiation
  - [x] 2.6 Configure dependency overrides in `backend/tests/conftest.py` for testing
  - [x] 2.7 Update existing unit tests to use dependency injection system

- [x] 3.0 Implement Async-Optimized Image Processing
  - [x] 3.1 Create `backend/services/async_image_processor.py` with `AsyncImageProcessor` class
  - [x] 3.2 Implement `process_image_async()` method using `asyncio.get_event_loop().run_in_executor()`
  - [x] 3.3 Move PIL/Pillow operations (`_ensure_png()` logic) to thread pool execution
  - [x] 3.4 Create `ThreadPoolExecutor` with configurable pool size for image processing
  - [x] 3.5 Update `OpenAIService.edit_image()` to use async image processor dependency
  - [x] 3.6 Maintain existing API response format while improving performance
  - [x] 3.7 Add performance logging to measure async optimization improvements


- [ ] 5.0 Reorganize API Structure and Error Handling
  - [ ] 5.1 Create `backend/app/api/v1/routers/` directory structure
  - [ ] 5.2 Move `health.py` endpoint to `backend/app/api/v1/routers/health.py` with router patterns
  - [ ] 5.3 Move `images.py` endpoint to `backend/app/api/v1/routers/images.py` with dependency injection
  - [ ] 5.4 Move `openai_integration.py` functionality to `backend/app/api/v1/routers/tasks.py`
  - [ ] 5.5 Create `backend/app/core/errors.py` with RFC 7807 Problem Details models
  - [ ] 5.6 Implement global exception handler for `HTTPException` to Problem Details conversion
  - [ ] 5.7 Update `backend/app/main.py` to use new router imports and exception handlers
  - [ ] 5.8 Add validation error handling with proper Problem Details format
  - [ ] 5.9 Replace raw OpenAI API errors with sanitized Problem Details responses

- [ ] 6.0 Implement Structured Logging and Observability
  - [x] 6.1 Add `structlog` dependency to `backend/requirements.txt`
  - [x] 6.2 Create `backend/app/core/logging.py` with structlog configuration
  - [ ] 6.3 Implement JSON log formatting for production and human-readable for development
  - [ ] 6.4 Create `backend/app/middleware/correlation.py` for X-Request-ID middleware
  - [ ] 6.5 Configure correlation ID injection into all log entries
  - [ ] 6.6 Add request/response logging with configurable log levels
  - [ ] 6.7 Update `backend/app/main.py` to use new logging and correlation middleware
  - [ ] 6.8 Include performance metrics (response time, status codes) in structured logs
  - [ ] 6.9 Replace existing `logger` usage throughout codebase with structured logging

- [ ] 7.0 Clean Up Code and Project Organization
  - [x] 7.1 Remove unused `backend/services/chat_storage.py` file
  - [x] 7.2 Remove unused `verify_connection()` method from `OpenAIService`
  - [x] 7.3 Clean up empty `backend/app/core/__init__.py` file
  - [x] 7.4 Remove pragma: no cover statements that will never execute in production
  - [ ] 7.5 Update import statements throughout codebase for new structure
  - [ ] 7.6 Organize service layer to separate business logic from infrastructure
  - [ ] 7.7 Update `backend/tests/` structure to match new API organization
  - [x] 7.8 Run linting and formatting tools to ensure code quality standards
