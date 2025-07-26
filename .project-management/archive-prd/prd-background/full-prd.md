# Product Requirements Document – Shiny-Broccoli

## 1. Overview

* **Problem Statement**: There is no lightweight, local demo that lets a learner experiment with masking-based image edits powered by OpenAI while also illustrating a complete React + FastAPI stack end-to-end.
* **Objectives & Success Metrics**:

  * Build the minimum-viable application that:

    * uploads an image, lets the user draw a mask, submits prompt + mask + image to OpenAI, and displays the edited result.
    * can be run entirely on an Ubuntu laptop without external services beyond the OpenAI API.
  * Learning success: Kevin’s son can explain the code and make small modifications independently.
  * Functional success: at least one end-to-end edit round-trip completes without errors.
* **Primary Personas**:

  * *Kevin – Mentor/Developer*: experienced engineer guiding the build.
  * *Son – Learner*: new to LLMs and web dev, uses the app to understand the workflow.

## 2. User Scenarios

* **Learner uploads image, draws mask, and describes edit** – to see how prompts and masks influence output.
* **Mentor demonstrates advanced mask shapes** – to teach free-form selection and troubleshooting.
* **Learner iterates prompts** – quickly resubmits different text to compare results, deepening prompt-engineering intuition.

## 3. Technology Stack

| Layer           | Choice                    | Notes                                              |
| --------------- | ------------------------- | -------------------------------------------------- |
| Front-end       | React + TypeScript (Vite) | Canvas API or Fabric.js for mask drawing           |
| Back-end / API  | FastAPI (Python 3.11)     | Handles multipart upload to OpenAI, streams result |
| Database        | None                      | In-memory only; files saved to /tmp if needed      |
| Infra & Hosting | Local laptop              | Ubuntu 22.04; no cloud; single-process serving     |
| CI/CD           | Manual local run          | GitHub repo only for version control               |
| Observability   | Console logging           | Simple stderr logs for request/response timing     |

## 4. High-Level Architecture & Project Structure

```mermaid
flowchart LR
    subgraph Client
        A[React UI] --> B(API Gateway)
        A <-- WebSocket -- progress --> B
    end
    B(FastAPI server) --> C{{OpenAI Image Edit Endpoint}}
```

## 5. Development Phases & Milestones

| Phase                      | Goal / Exit Criteria                               | Indicative Duration | Dependencies |
| -------------------------- | -------------------------------------------------- | ------------------- | ------------ |
| 0. Project Initialization  | Git repo, Vite + FastAPI skeleton, API key env var | TBD                 | —            |
| 1. Foundation Epic         | File upload, basic canvas, FastAPI POST stub       | TBD                 | 0            |
| 2. Core Functionality Epic | Mask drawing, OpenAI edit call, result display tab | TBD                 | 1            |
| 3. Polish & Learning Epic  | Code comments, README tutorial for son             | TBD                 | 2            |
| N. Launch & Handover       | Son successfully edits code & completes a prompt   | TBD                 | all          |

## 6. Assumptions & Constraints

* Runs offline except for outbound HTTPS to `api.openai.com`.
* No persistent storage—images live only for the session.
* OpenAI key stored in local `.env`; rotate manually.
* Laptop has sufficient RAM/CPU and stable internet for API calls.

## 7. Open Questions / Risks

* Handling of large images (>50 MB)—should we auto-downscale?
* Rate-limit or cost spikes if many edits are tested rapidly.
* Future need for masking library (Fabric.js vs. pure canvas) may add complexity.

END OF PRD
