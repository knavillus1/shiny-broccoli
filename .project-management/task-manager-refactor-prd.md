# Product Requirements Document: Backend Task Manager Refactoring

## Document Information
- **Version**: 1.0
- **Date**: June 14, 2025
- **Author**: Development Team
- **Status**: Draft

---

## Executive Summary

This PRD outlines the refactoring of the backend's asynchronous task management system from a fragile global state implementation to a robust, dependency-injected service. This initiative addresses critical architectural weaknesses that pose scalability and reliability risks to the application.

## Problem Statement

### Current Implementation Issues

The existing task management system in `backend/services/domain/task_manager.py` suffers from several critical architectural flaws:

1. **Fragile Global State**: Uses a module-level dictionary `_tasks: Dict[str, TaskRecord] = {}` that creates unpredictable, globally mutable state
2. **Concurrency Vulnerabilities**: Not thread-safe, would fail immediately with race conditions in multi-worker deployments
3. **Dependency Injection Violations**: Bypasses FastAPI's dependency injection system, creating tight coupling and inconsistent patterns
4. **Poor Testability**: Global state makes unit testing difficult and unreliable

### Impact Assessment

- **Production Risk**: Application cannot scale beyond single worker without data corruption
- **Code Quality**: Inconsistent architecture patterns across the codebase
- **Developer Experience**: Difficult to test and maintain async workflows
- **Technical Debt**: Core feature built on fundamentally flawed foundation

## Business Objectives

### Primary Goals
1. **Eliminate Production Scalability Blockers**: Enable multi-worker deployment capability
2. **Improve Code Quality**: Align task management with established architectural patterns
3. **Enhance Testability**: Enable reliable, isolated testing of async workflows
4. **Maintain Feature Parity**: Zero breaking changes to existing functionality

### Success Metrics
- [ ] Zero API contract changes
- [ ] All existing tests pass without modification
- [ ] New implementation supports concurrent access
- [ ] Test coverage maintains or improves
- [ ] Performance characteristics remain equivalent

## Solution Overview

### Proposed Architecture

Transform the task manager from a module with global functions to a class-based service managed through dependency injection:

```python
class TaskManager:
    """Manages the lifecycle of async tasks in memory."""
    
    def __init__(self) -> None:
        self._tasks: Dict[str, TaskRecord] = {}
        
    # Methods replace module-level functions
```

### Key Design Principles
1. **Singleton Pattern**: Single instance shared across the application
2. **Dependency Injection**: Provided through FastAPI's DI system
3. **Interface Compatibility**: Identical method signatures to current functions
4. **Encapsulation**: Private state with controlled access

## Detailed Requirements

### Functional Requirements

#### FR-1: TaskManager Class Implementation
- **Requirement**: Convert module functions to class methods
- **Details**: 
  - Maintain identical method signatures
  - Encapsulate `_tasks` dictionary as instance attribute
  - Preserve all existing behavior
- **Files**: `backend/services/domain/task_manager.py`

#### FR-2: Dependency Injection Integration
- **Requirement**: Provide TaskManager as a singleton dependency
- **Details**:
  - Create `get_task_manager()` function in dependencies.py
  - Remove `get_task_repository()` function
  - Ensure single instance across application lifecycle
- **Files**: `backend/app/core/dependencies.py`

#### FR-3: Router Refactoring
- **Requirement**: Inject TaskManager into API endpoints
- **Details**:
  - Replace direct imports with dependency injection
  - Pass TaskManager instance to background tasks
  - Update all task-related endpoints
- **Files**: `backend/app/api/v1/routers/tasks.py`

#### FR-4: Background Task Integration
- **Requirement**: Pass TaskManager to async background processes
- **Details**:
  - Modify `_process_request` function signature
  - Ensure background tasks use injected instance
- **Files**: `backend/app/api/v1/routers/tasks.py`

### Non-Functional Requirements

#### NFR-1: Performance
- Response times must remain within 5% of current performance
- Memory usage should not increase significantly
- No impact on startup time

#### NFR-2: Reliability
- Thread-safe operations for concurrent access
- Graceful handling of edge cases
- No data loss during task state transitions

#### NFR-3: Maintainability
- Clear separation of concerns
- Consistent with existing dependency injection patterns
- Comprehensive documentation

#### NFR-4: Testability
- Enable dependency override for testing
- Support isolated unit tests
- Mock-friendly interface design

## Implementation Plan

### Phase 1: Core Refactoring (Priority: High)
**Estimated Time**: 2-3 hours

#### Task 1.1: Convert TaskManager to Class
- Transform module functions to class methods
- Encapsulate global state as instance attribute
- Maintain method signatures and behavior
- **Files**: `backend/services/domain/task_manager.py`

#### Task 1.2: Update Dependencies
- Create `get_task_manager()` singleton provider
- Remove `get_task_repository()` function
- **Files**: `backend/app/core/dependencies.py`

#### Task 1.3: Refactor Task Router
- Inject TaskManager via `Depends()`
- Update background task parameter passing
- Replace direct module imports
- **Files**: `backend/app/api/v1/routers/tasks.py`

### Phase 2: Testing and Validation (Priority: High)
**Estimated Time**: 1-2 hours

#### Task 2.1: Verify Existing Tests
- Run full test suite to ensure no regressions
- Fix any test failures caused by refactoring
- **Files**: `backend/tests/`

#### Task 2.2: Add Integration Tests
- Test concurrent task access scenarios
- Validate dependency injection behavior
- **Files**: `backend/tests/integration/`

#### Task 2.3: Performance Validation
- Benchmark key endpoints before/after changes
- Verify memory usage patterns
- **Files**: Performance test scripts

### Phase 3: Documentation and Cleanup (Priority: Medium)
**Estimated Time**: 30 minutes

#### Task 3.1: Update Documentation
- Document new dependency injection pattern
- Update code comments and docstrings
- **Files**: Code documentation, README updates

#### Task 3.2: Code Review and Cleanup
- Remove any unused imports
- Ensure consistent coding standards
- **Files**: All modified files

## Technical Specifications

### File Modifications Required

#### 1. `backend/services/domain/task_manager.py`
```python
class TaskManager:
    """Manages the lifecycle of async tasks in memory."""

    def __init__(self) -> None:
        self._tasks: Dict[str, TaskRecord] = {}

    def create_task(self, task_id: str, eta_seconds: int = 30) -> None:
        """Create a new task entry."""
        self._tasks[task_id] = TaskRecord(eta_seconds=eta_seconds)

    def set_result(self, task_id: str, result: dict[str, Any]) -> None:
        rec = self._tasks.get(task_id)
        if rec:
            rec.status = "completed"
            rec.result = result

    def set_error(self, task_id: str, error: str) -> None:
        rec = self._tasks.get(task_id)
        if rec:
            rec.status = "error"
            rec.error = error

    def get_task(self, task_id: str) -> TaskRecord | None:
        return self._tasks.get(task_id)
```

#### 2. `backend/app/core/dependencies.py`
```python
from backend.services.domain.task_manager import TaskManager

# Create singleton instance
_task_manager = TaskManager()

def get_task_manager() -> TaskManager:
    """Provide the singleton TaskManager instance."""
    return _task_manager
```

#### 3. `backend/app/api/v1/routers/tasks.py`
```python
from backend.services.domain.task_manager import TaskManager
from backend.app.core.dependencies import get_task_manager

async def _process_request(
    # ... existing parameters ...
    task_manager: TaskManager,
) -> None:
    # Use task_manager instead of module functions
    task_manager.set_result(request_id, result)

@router.post("/images/edit")
async def edit_image(
    # ... existing parameters ...
    task_manager: TaskManager = Depends(get_task_manager),
):
    task_manager.create_task(request_id, eta_seconds)
    background_tasks.add_task(
        _process_request,
        # ... existing parameters ...
        task_manager,  # Pass instance to background task
    )
```

## Risk Assessment

### High Risk Items
1. **Breaking Changes**: Potential API contract violations
   - **Mitigation**: Comprehensive testing, identical method signatures
2. **Performance Regression**: Dependency injection overhead
   - **Mitigation**: Singleton pattern, performance benchmarking

### Medium Risk Items
1. **Test Failures**: Existing tests may fail due to state changes
   - **Mitigation**: Incremental testing, dependency overrides
2. **Background Task Issues**: Parameter passing complexity
   - **Mitigation**: Careful parameter validation, integration tests

### Low Risk Items
1. **Import Conflicts**: Circular dependency issues
   - **Mitigation**: Proper import organization, local imports where needed

## Testing Strategy

### Unit Testing
- Test TaskManager class methods in isolation
- Verify dependency injection behavior
- Mock TaskManager for dependent component tests

### Integration Testing
- Test full request lifecycle with new TaskManager
- Validate background task execution
- Test concurrent request scenarios

### Performance Testing
- Benchmark key endpoints before/after changes
- Monitor memory usage patterns
- Validate scalability improvements

### Regression Testing
- Run full existing test suite
- Verify all API contracts remain unchanged
- Test edge cases and error conditions

## Quality Assurance

### Code Review Checklist
- [ ] All module-level state eliminated
- [ ] Dependency injection used consistently
- [ ] Method signatures preserved exactly
- [ ] Background tasks receive TaskManager instance
- [ ] Error handling maintained
- [ ] Documentation updated

### Acceptance Criteria
- [ ] All existing tests pass without modification
- [ ] New TaskManager supports concurrent access
- [ ] No breaking changes to API contracts
- [ ] Performance within 5% of baseline
- [ ] Code follows established patterns

## Rollback Plan

### Immediate Rollback (< 1 hour)
1. Revert all file changes via git
2. Redeploy previous version
3. Validate service restoration

### Partial Rollback
1. Revert specific file changes
2. Address specific issues
3. Re-deploy fixed version

## Dependencies and Assumptions

### Dependencies
- FastAPI dependency injection system
- Existing test infrastructure
- Python 3.11+ type annotations

### Assumptions
- Single-process development environment for initial testing
- Existing API contracts must remain unchanged
- Current performance characteristics are acceptable baseline

## Post-Implementation

### Monitoring
- Track task creation/completion rates
- Monitor memory usage patterns
- Validate error rates remain stable

### Future Enhancements
- Consider persistent task storage for production
- Implement task cleanup and expiration
- Add task priority and queuing capabilities

### Documentation Updates
- Update developer onboarding guides
- Document new dependency injection patterns
- Create architectural decision record (ADR)

---

## Appendix

### Current Architecture Issues
```python
# PROBLEMATIC: Global mutable state
_tasks: Dict[str, TaskRecord] = {}

def create_task(task_id: str, eta_seconds: int = 30) -> None:
    _tasks[task_id] = TaskRecord(eta_seconds=eta_seconds)  # Race condition risk
```

### Proposed Architecture
```python
# SOLUTION: Encapsulated, injectable service
class TaskManager:
    def __init__(self) -> None:
        self._tasks: Dict[str, TaskRecord] = {}  # Instance state
    
    def create_task(self, task_id: str, eta_seconds: int = 30) -> None:
        self._tasks[task_id] = TaskRecord(eta_seconds=eta_seconds)
```

### API Impact Analysis
- **No breaking changes**: All endpoints maintain identical request/response formats
- **Internal refactoring only**: Changes are implementation details
- **Improved reliability**: Better concurrent access handling
