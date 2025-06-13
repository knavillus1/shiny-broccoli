# PRD: Project Initialization

## 1. Introduction/Overview

This PRD defines the project initialization phase for the Shiny-Broccoli AI image editing application. The goal is to establish a complete, working development environment with a React + TypeScript frontend and FastAPI backend that can be run locally on Ubuntu 22.04. This phase creates the foundational structure and tooling needed for subsequent development phases, ensuring both mentor (Kevin) and learner (son) can start development with a properly configured stack.

## 2. Goals

- **G1**: Create a complete Vite + React + TypeScript frontend skeleton with development tooling
- **G2**: Set up a FastAPI backend skeleton with Python 3.11 and proper project structure  
- **G3**: Configure environment variable management for OpenAI API key storage
- **G4**: Establish development scripts for easy project startup and testing
- **G5**: Ensure the entire stack can run locally without external dependencies (except OpenAI API)
- **G6**: Create initial documentation for project setup and development workflow

## 3. User Stories

- **US1**: As Kevin (mentor), I want to clone the repo and run a single command to start both frontend and backend so that I can quickly demonstrate the stack to my son
- **US2**: As Kevin's son (learner), I want clear instructions for setting up the development environment so that I can start learning without technical barriers
- **US3**: As a developer, I want the frontend and backend to communicate with a simple "Hello World" API call so that I can verify the full stack is working
- **US4**: As a developer, I want environment variable configuration documented so that I can securely manage the OpenAI API key
- **US5**: As a developer, I want linting and basic error checking configured so that code quality is maintained from the start

## 4. Functional Requirements

**Frontend Requirements:**
1. **FR1**: The system must create a Vite-based React application with TypeScript configuration
2. **FR2**: The system must include ESLint and TypeScript configuration for code quality
3. **FR3**: The system must have a basic React component structure with routing capability
4. **FR4**: The system must include a simple UI that can make API calls to the backend
5. **FR5**: The frontend must serve on a configurable port (default: 5173) with hot reloading

**Backend Requirements:**
6. **FR6**: The system must create a FastAPI application with Python 3.11 compatibility
7. **FR7**: The system must include a requirements.txt with all necessary dependencies
8. **FR8**: The system must have a basic API endpoint structure with CORS configuration
9. **FR9**: The system must include a health check endpoint for system verification
10. **FR10**: The backend must serve on a configurable port (default: 8000) with auto-reload

**Environment & Configuration:**
11. **FR11**: The system must support .env file configuration for environment variables
12. **FR12**: The system must include OpenAI API key configuration template
13. **FR13**: The system must have .gitignore configured to exclude sensitive files and build artifacts
14. **FR14**: The system must include development startup scripts for both platforms

**Development Tooling:**
15. **FR15**: The system must include package management configuration (package.json, requirements.txt)
16. **FR16**: The system must have basic testing framework setup (though tests can be minimal)
17. **FR17**: The system must include development documentation in README.md

## 5. Non-Goals (Out of Scope)

- **NG1**: No cloud deployment configuration (local development only)
- **NG2**: No database setup or ORM configuration (in-memory only per full PRD)
- **NG3**: No authentication or user management system
- **NG4**: No production-ready configuration or Docker setup
- **NG5**: No CI/CD pipeline configuration beyond basic linting
- **NG6**: No advanced image processing or OpenAI integration (covered in later phases)
- **NG7**: No complex UI components or styling frameworks (basic styling only)

## 6. Design Considerations

- **Frontend**: Use the design mockup provided in `/Users/kevinsullivan/code/shiny-broccoli/.project-management/current-prd/prd-background/design-mock.html` as reference for the visual direction, but implement only basic layout structure in this phase
- **API Design**: Follow RESTful conventions with clear endpoint naming
- **File Structure**: Organize code in logical directories (components, services, hooks for frontend; routes, services, models for backend)
- **Development Experience**: Prioritize fast feedback loops with hot reloading and clear error messages

## 7. Technical Considerations

- **Python Version**: Must use Python 3.11 as specified in the full PRD
- **Node Version**: Should use a stable LTS version of Node.js (18.x or 20.x)
- **Port Configuration**: Frontend (5173), Backend (8000) with environment variable overrides
- **CORS**: Configure CORS properly to allow frontend-backend communication during development
- **Environment Variables**: Use python-dotenv for Python and standard .env support for Vite
- **Dependency Management**: Pin versions in requirements.txt and package.json for reproducibility

## 8. Success Metrics

- **SM1**: Both frontend and backend start without errors using development scripts
- **SM2**: Frontend can successfully make an API call to backend health check endpoint
- **SM3**: Environment variable loading works correctly (verified with test API key placeholder)
- **SM4**: Linting passes on all initial code files
- **SM5**: README documentation is clear enough for Kevin's son to follow setup independently
- **SM6**: Project can be cloned and running within 10 minutes on a fresh Ubuntu 22.04 system

## 9. Open Questions

- **OQ1**: Should we include TypeScript strict mode configuration from the start?
- **OQ2**: What specific Python dependencies should be included beyond FastAPI (uvicorn, python-dotenv, etc.)?
- **OQ3**: Should the development startup script use concurrent execution or separate terminals?
- **OQ4**: Do we need any specific VS Code configuration files for the development environment?

## 10. Referenced PRD-background files

- **`/Users/kevinsullivan/code/shiny-broccoli/.project-management/current-prd/prd-background/full-prd.md`**: Contains the complete project vision, technology stack requirements, and phase definitions. Defines Phase 0 goals and overall architecture.
- **`/Users/kevinsullivan/code/shiny-broccoli/.project-management/current-prd/prd-background/design-mock.html`**: Provides UI design reference and visual direction for the application. Contains color palette, typography, and component styling that should influence the basic layout structure.
- **`/Users/kevinsullivan/code/shiny-broccoli/.project-management/current-prd/prd-background/image_edit_spec.md`**: Technical specification for OpenAI image editing integration. While not directly relevant for initialization, provides context for environment variable requirements and API structure planning.
