# Shiny Broccoli

An AI-powered image editing application that uses OpenAI's image editing capabilities to modify images based on text prompts and custom masks.

## Overview

Shiny Broccoli is a full-stack web application that provides an intuitive interface for AI-powered image editing. Users can upload images, create custom masks using drawing tools, and provide text prompts to generate edited versions of their images using OpenAI's DALL-E API.

### Key Features

- **Interactive Image Editor**: Upload PNG/JPEG images with a responsive canvas interface
- **Mask Creation Tools**: Draw custom masks with adjustable brush sizes and shapes
- **AI-Powered Editing**: Leverage OpenAI's image editing API for intelligent modifications
- **Real-time Progress**: Live feedback during image processing
- **Before/After Comparison**: Side-by-side display of original and edited images
- **Download Results**: Save edited images locally

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **UI Components**: Custom canvas-based image editor with drawing tools
- **Testing**: Vitest with React Testing Library

### Backend
- **Framework**: FastAPI (Python)
- **API Integration**: OpenAI API for image editing
- **Image Processing**: Pillow (PIL) for image optimization
- **Testing**: pytest with async support
- **Documentation**: Auto-generated OpenAPI/Swagger docs

## Project Structure

```
shiny-broccoli/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/v1/endpoints/  # API route handlers
│   │   ├── core/              # Configuration and settings
│   │   └── main.py            # FastAPI application entry point
│   ├── services/              # Business logic and external integrations
│   └── tests/                 # Backend test suite
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Route components
│   │   └── services/          # API client and utilities
│   └── tests/                 # Frontend test suite
└── docs/                      # User documentation
```

## Quick Start

### Prerequisites

- **Python**: 3.11+ (3.12 recommended)
- **Node.js**: 18+ (20 recommended)
- **OpenAI API Key**: Required for image editing functionality

### Automated Setup

Run the development initialization script from the project root:

```bash
./dev_init.sh
```

This script will:
- Check system prerequisites
- Install backend dependencies (Python virtual environment)
- Install frontend dependencies (npm packages)
- Start both backend and frontend development servers

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.template .env
# Edit .env and add your OPENAI_API_KEY
```

5. Start the development server:
```bash
uvicorn backend.app.main:app --reload --port 8000
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.template .env
# Configure frontend environment if needed
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. **Open the application** in your browser (typically `http://localhost:5173`)

2. **Upload an image** using the file upload button (PNG or JPEG formats supported)

3. **Create a mask** by drawing on the canvas overlay to indicate areas you want to modify

4. **Enter a text prompt** describing the desired changes

5. **Submit for processing** and wait for the AI to generate the edited image

6. **View results** in the side-by-side comparison and download if satisfied

## API Endpoints

The backend provides a RESTful API with the following main endpoints:

- `GET /` - Health check and welcome message
- `GET /api/v1/health` - Detailed health status
- `POST /api/v1/images/edit` - Submit image editing request
- `POST /api/v1/openai/edit` - Direct OpenAI integration endpoint

API documentation is available at `http://localhost:8000/docs` when running the backend.

## Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Full Test Suite
```bash
./run_tests.sh
```

## Development

### Code Quality
- **Backend**: Flake8 linting
- **Frontend**: ESLint with TypeScript support
- **Testing**: Comprehensive unit and integration tests

### Environment Configuration
- Backend configuration via environment variables and `pydantic-settings`
- Frontend configuration via Vite environment variables
- CORS properly configured for development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Ensure all tests pass
5. Submit a pull request

## License

See [LICENSE](LICENSE) file for details.

## Documentation

- [User Guide](docs/user_guide.md) - Detailed usage instructions
- [Development Guide](DEVELOPMENT.md) - Development environment setup
- [Changelog](CHANGELOG.md) - Version history and changes
