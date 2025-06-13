## Pre-Feature Development Project Tree
```
/Users/kevinsullivan/code/shiny-broccoli
├── .codex
│   └── install.sh
├── .env
├── .flake8
├── .gitignore
├── .project-management
│   ├── archive-prd
│   │   ├── prd-background
│   │   ├── prd-feature0.md
│   │   └── tasks-prd.feature0.md
│   ├── close-prd.md
│   ├── closed-prd
│   │   ├── prd-feature1.md
│   │   └── tasks-prd-feature1.md
│   ├── create-full-project-prd.md
│   ├── create-prd.md
│   ├── current-prd
│   │   ├── prd-background
│   │   │   ├── design-mock.html
│   │   │   ├── full-prd.md
│   │   │   └── image_edit_spec.md
│   │   ├── prd-feature2.md
│   │   ├── tasks-prd-feature2.md
│   │   └── tasks-prd-project-initialization.md
│   ├── generate-design-mock.md
│   ├── generate-tasks.md
│   ├── process-tasks-cloud.md
│   ├── process-tasks-local.md
│   └── tasks
│       └── prd-project-initialization.md
├── AGENTS.md
├── backend
│   ├── requirements.txt
│   └── services
│       └── chat_storage.py
├── CHANGELOG.md
├── dev_init.sh
├── DEVELOPMENT.md
├── frontend
│   ├── eslint.config.js
│   ├── package.json
│   └── src
│       ├── components
│       │   ├── ChatArea.tsx
│       │   ├── MessageBubble.tsx
│       │   └── Sidebar.tsx
│       ├── hooks
│       │   └── useChat.ts
│       └── services
│           └── api.ts
├── LICENSE
├── README.md
└── run_tests.sh
```

## Relevant Files

### Files Created or Modified
- `backend/app/main.py` - FastAPI app initialization with CORS and router setup.
- `backend/app/api/v1/endpoints/health.py` - Defines the `/health` endpoint.
- `backend/app/core/config.py` - Application settings loaded from `.env`.
- `backend/tests/conftest.py` - Pytest configuration providing a test client.
- `backend/tests/api/v1/test_health.py` - Tests the health endpoint.
- `backend/.env.example` - Example environment variables file.
- `backend/requirements.txt` - Updated dependencies.
- `backend/start.sh` - Development script to run Uvicorn with auto-reload.
- `frontend/.env.example` - Example Vite environment variables file.
- `frontend/src/services/api.ts` - Fetch helper using `VITE_API_BASE_URL`.
- `.gitignore` - Updated ignore patterns.

### Notes

- **Unit Tests:** Place alongside the code files they test (e.g., `HomePage.tsx` and `HomePage.test.tsx`).
- **`dev_init.sh`:** This script should facilitate a one-command setup and start for local development. It should:
    - Check for and guide installation of prerequisites (Python 3.11, Node LTS, pip, npm).
    - Install frontend dependencies (`npm install` in `frontend` directory).
    - Install backend dependencies (`pip install -r requirements.txt` in `backend` directory, preferably in a virtual environment).
    - Optionally, create a `.env` file from `.env.example` if one doesn't exist.
    - Start both frontend and backend development servers (concurrently or in separate terminals as decided by OQ3).
- **`.codex/install.sh`:** This script should ensure the sandbox environment has Python 3.11 and a stable LTS version of Node.js (18.x or 20.x) available for the agent.
- **Dependency Pinning:** Pin versions in `frontend/package.json` and `backend/requirements.txt` for reproducibility.
- **Design & Tech Considerations from PRD:**
    - **Frontend Layout:** Implement a very basic layout structure inspired by `/Users/kevinsullivan/code/shiny-broccoli/.project-management/current-prd/prd-background/design-mock.html`. Focus on placeholders for future UI elements rather than full styling.
    - **API Design:** Endpoints should follow RESTful conventions. The health check is a GET request.
    - **File Structure:** Adhere to logical directory structures (e.g., `frontend/src/components`, `frontend/src/pages`, `frontend/src/services`, `backend/app/api/v1/endpoints`).
    - **Development Experience:** Ensure Vite provides hot reloading for the frontend and Uvicorn for the backend. Error messages should be clear.
    - **Python Version:** Strictly Python 3.11.
    - **Node Version:** Stable LTS (18.x or 20.x).
    - **Port Configuration:** Frontend: 5173, Backend: 8000. Make these configurable via environment variables if possible, but default to these.
    - **CORS:** Backend (FastAPI) must be configured to allow requests from the frontend development server (localhost:5173).
    - **Environment Variables:** Use `python-dotenv` for the backend and Vite's built-in `.env` support for the frontend.

## Tasks

- [ ] 1.0 Initialize Frontend Project (Vite + React + TypeScript). This task is informed by the design mock-up found at `/Users/kevinsullivan/code/shiny-broccoli/.project-management/current-prd/prd-background/design-mock.html`.
  - [ ] 1.1 Set up a new Vite project with the React TypeScript template in the `frontend` directory.
  - [ ] 1.2 Install necessary dependencies: `react-router-dom`, `axios` (or preferred HTTP client).
  - [ ] 1.3 Configure ESLint and Prettier for code quality and consistency (e.g., create/update `frontend/.eslintrc.cjs`, `frontend/.prettierrc`). Ensure TypeScript linting rules are active.
  - [ ] 1.4 Create basic directory structure: `frontend/src/pages`, `frontend/src/components`, `frontend/src/services`, `frontend/src/router.tsx`.
  - [ ] 1.5 Implement basic routing in `frontend/src/router.tsx` and integrate it into `frontend/src/App.tsx` and `frontend/src/main.tsx`.
  - [ ] 1.6 Create a simple `HomePage.tsx` component in `frontend/src/pages/`.
  - [ ] 1.7 Configure Vite (`frontend/vite.config.ts`) to run the dev server on port 5173 and ensure hot reloading is functional.
  - [ ] 1.8 Create a basic `App.test.tsx` to ensure the testing framework (Vitest or Jest) is configured and working.
- [ ] 2.0 Initialize Backend Project (FastAPI + Python 3.11)
  - [x] 2.1 Create a `backend/app` directory for the FastAPI application.
  - [x] 2.2 Initialize a `backend/requirements.txt` file with `fastapi`, `uvicorn[standard]`, `python-dotenv`, `pytest`, `httpx`.
  - [x] 2.3 Create `backend/app/main.py` to initialize the FastAPI app.
  - [x] 2.4 Implement CORS middleware in `backend/app/main.py` to allow requests from `http://localhost:5173`.
  - [x] 2.5 Create `backend/app/api/v1/endpoints/health.py` with a GET `/health` endpoint that returns a simple JSON response (e.g., `{"status": "ok"}`).
  - [x] 2.6 Register the health endpoint router in `backend/app/main.py`.
  - [x] 2.7 Configure Uvicorn to run the FastAPI app on port 8000 with auto-reload for development (e.g., via a script in `package.json` or a helper script).
  - [x] 2.8 Create basic test setup in `backend/tests/` (e.g. `backend/tests/conftest.py`) and a test for the health endpoint in `backend/tests/api/v1/test_health.py`.
- [ ] 3.0 Configure Project Environment and Core Setup 
  - [x] 3.1 Create a root `.gitignore` file, ensuring it covers `node_modules`, Python `__pycache__`, virtual environments (`.venv`, `venv`), `.env` files, OS-specific files (e.g., `.DS_Store`), and build artifacts.
  - [x] 3.2 Create `backend/.env.example` with a placeholder for `OPENAI_API_KEY=""`.
  - [x] 3.3 Implement environment variable loading in `backend/app/core/config.py` using Pydantic Settings to read from `.env`.
  - [x] 3.4 Ensure Vite frontend correctly handles environment variables (e.g., `VITE_API_BASE_URL`) via `.env` files in the `frontend` directory. Create `frontend/.env.example` if needed.
- [ ] 4.0 Establish Basic Full-Stack Connectivity & Verification
  - [ ] 4.1 Create `frontend/src/services/apiClient.ts` to handle API calls to the backend (e.g., using Axios, configured with `VITE_API_BASE_URL=http://localhost:8000/api/v1`).
  - [ ] 4.2 Create `frontend/src/components/HealthCheckDisplay.tsx` that calls the backend's `/health` endpoint via `apiClient.ts` and displays the status.
  - [ ] 4.3 Add the `HealthCheckDisplay` component to `HomePage.tsx`.
  - [ ] 4.4 Verify that the frontend successfully calls the backend and displays the health status.
- [ ] 5.0 Finalize Development Tooling, Scripts, and Documentation
  - [ ] 5.1 Create/Update `dev_init.sh` script in the root directory to:
    - [ ] 5.1.1 Check for Python 3.11 and Node LTS.
    - [ ] 5.1.2 Set up Python virtual environment in `backend/.venv` and install `requirements.txt`.
    - [ ] 5.1.3 Install frontend dependencies (`npm install` in `frontend`).
    - [ ] 5.1.4 Copy `.env.example` to `.env` in `backend` if `.env` doesn't exist.
    - [ ] 5.1.5 Launch both backend (Uvicorn from `backend` dir) and frontend (Vite dev server from `frontend` dir) services, potentially using a concurrent runner or clear instructions for separate terminals.
  - [ ] 5.2 Update/Create `.codex/install.sh` to ensure Python 3.11 and Node LTS are available in the agent's environment.
  - [ ] 5.3 Create/Update the root `README.md` with:
    - [ ] 5.3.1 Project overview.
    - [ ] 5.3.2 Detailed prerequisites (Python 3.11, Node LTS, pip, npm/yarn).
    - [ ] 5.3.3 Step-by-step setup instructions using `dev_init.sh`.
    - [ ] 5.3.4 Instructions on how to run the frontend and backend separately if needed.
    - [ ] 5.3.5 Information on environment variable setup (`.env` files).
    - [ ] 5.3.6 Basic troubleshooting tips.
  - [ ] 5.4 Ensure all initial code files pass linting checks.
  - [ ] 5.5 Manually verify all success metrics from the PRD (SM1-SM6) are met.
*End of document*
