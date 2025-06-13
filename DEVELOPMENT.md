### Notes on local development setup.

## Local Development
This section describes development environment setup and is maintained by the codex agent.

### Frontend
Run `npm install` inside `frontend` to install dependencies. Start the dev server with `npm run dev`.

### Backend
Create a virtual environment in `backend/.venv` and install requirements:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env  # edit OPENAI_API_KEY with your key
```

Start the server using Uvicorn:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

Alternatively run the combined `dev_init.sh` script from the repository root to automate these steps.
