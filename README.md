# LearnFlow LMS

LearnFlow is a modern Learning Management System (LMS) built with a Pomodoro-first architecture, focusing on sequential mastery, gated assessments, and distraction-free learning. 

## Technology Stack

- **Backend:** Python, FastAPI, PostgreSQL, Redis, Celery, Alembic
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Query

---

## Prerequisites

Before setting up the project, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (for database and Redis)
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) (with `npm`)

---

## 1. Infrastructure Setup (Database & Redis)

The project relies on PostgreSQL for the database and Redis for Celery task queuing (like sending OTP emails). We provide a `docker-compose.yml` file to spin these up quickly.

1. Open a terminal in the root directory.
2. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```
   *This starts PostgreSQL on port `5432` and Redis on port `6379`.*

---

## 2. Backend Setup

The backend is built with FastAPI and runs on Python.

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (if it doesn't already exist) and populate it with your database URL, Redis URL, and SMTP details for sending emails:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnflow
   REDIS_URL=redis://localhost:6379/0
   SECRET_KEY=supersecretkey_for_local_dev_only
   
   # SMTP Configuration (Required for OTP emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your.email@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_FROM_EMAIL=your.email@gmail.com
   ```

4. **Initialize the Database Schema:**
   The initial schema is defined in a raw SQL script. Apply it first:
   ```bash
   python scripts/apply_migration.py
   ```
   
   Next, apply all subsequent Alembic migrations to bring your database schema up to the latest version:
   ```bash
   alembic upgrade head
   ```

5. **Seed the Database (Optional but recommended):**
   To test the platform, you can seed the database with a sample course and multiple-choice questions (MCQs):
   ```bash
   python scripts/seed_courses.py
   python scripts/seed_mcqs.py
   ```

6. **Start the FastAPI Server:**
   ```bash
   uvicorn api.main:app --reload
   ```
   *The API will be available at `http://localhost:8000`.*

---

## 3. Background Tasks (Celery)

LearnFlow uses Celery to handle background tasks asynchronously, such as sending OTP verification emails. 

1. Open a **new terminal window** in the root directory.
2. Activate your virtual environment:
   ```bash
   source .venv/bin/activate
   ```
3. Start the Celery worker:
   ```bash
   celery -A library.communication.tasks worker --loglevel=info
   ```

---

## 4. Frontend Setup

The frontend is a React Single Page Application (SPA) powered by Vite.

1. Open a **new terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

---

## Summary of Running Services

To have the full application running locally, you need the following running simultaneously:
1. Docker Compose (PostgreSQL & Redis)
2. FastAPI Server (`uvicorn api.main:app --reload`)
3. Celery Worker (`celery -A library.communication.tasks worker --loglevel=info`)
4. Frontend Server (`npm run dev` in `frontend/web`)
