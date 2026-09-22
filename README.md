# LearnFlow LMS

LearnFlow is a modern Learning Management System (LMS) built with a Pomodoro-first architecture, focusing on sequential mastery, gated assessments, and distraction-free learning. 

## Technology Stack

- **Backend:** Python, FastAPI, PostgreSQL, Redis, Celery, Alembic
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Query

---

## Prerequisites

Before setting up the project, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

---

## Running the Application (Recommended)

We have containerized the entire application so that you can run it with a single command, without needing to install Node, Python, or configure local environments manually. The frontend is configured for live-reloading, so any changes you make to the source code will instantly appear in the browser.

1. **Configure Environment Variables (Optional):**
   Create a `.env` file in the root directory (if it doesn't already exist) to configure SMTP for OTP emails:
   ```env
   # SMTP Configuration (Required for OTP emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your.email@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_FROM_EMAIL=your.email@gmail.com
   ```
   *(Note: The database and redis URLs are already configured securely inside `docker-compose.yml` for local development).*

2. **Start the Stack:**
   Open a terminal in the root directory and run:
   ```bash
   docker-compose up --build
   ```
   *This single command builds and starts PostgreSQL, Redis, the FastAPI backend, the Celery worker, and the Vite frontend server.*

3. **Automatic Database Initialization:**
   The backend container is configured to automatically run the initial schema script and all Alembic migrations before starting.

4. **Access the Application:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Seeding Sample Data

To test the platform, you can quickly seed the database with a sample course and multiple-choice questions (MCQs).

With the docker containers running, open a new terminal window and run:
```bash
docker-compose exec backend python scripts/seed_courses.py
docker-compose exec backend python scripts/seed_mcqs.py
```

---

## Development Details

- **Backend Hot-Reloading:** The FastAPI server inside the container runs with `--reload`. If you modify python files, it will automatically restart.
- **Frontend Live-Reloading:** The Vite server inside the container runs in dev mode with volume mounts. Saving a React file will instantly reflect in the browser.
