# Test Structure

## Directory Organization

The backend tests are organized into two main directories:

- `backend/tests/unit/`: Contains unit tests that use mocks and do not call real external APIs
- `backend/tests/integration/`: Contains integration tests that use real API endpoints (currently empty)

## Running Tests

### Run all tests (unit + integration)
```bash
./run_tests.sh
```

### Run only unit tests (skip integration tests)
```bash
./run_tests.sh -no_integration
```

### Pass additional pytest arguments
```bash
./run_tests.sh -v                    # Run all tests with verbose output
./run_tests.sh -no_integration -v    # Run only unit tests with verbose output
./run_tests.sh -k test_health        # Run only tests matching pattern
```

## Test Categories

- **Unit Tests**: Tests that use mocks and stubs to isolate the code under test. These are fast and don't require external dependencies.
- **Integration Tests**: Tests that call real external APIs and test the complete flow. These may be slower and require API keys or network access.
