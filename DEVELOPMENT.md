### Notes on local development setup.

## Local Development
This section describes development environment setup and is maintained by the codex agent.

### Frontend
Run `npm install` inside `frontend` to install dependencies:
```bash
cd frontend
cp .env.template .env
npm run dev
```

### Backend
Create a virtual environment in `backend/.venv` and install requirements:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment variables
cp .env.template .env  # edit OPENAI_API_KEY with your key
```

Start the server using Uvicorn:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

Alternatively run the combined `dev_init.sh` script from the repository root to automate these steps.
