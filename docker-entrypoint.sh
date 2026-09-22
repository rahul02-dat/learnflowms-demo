#!/bin/bash
set -e

# Only run migrations if the command is starting the main web server
if [[ "$1" == "uvicorn" ]]; then
    echo "Waiting for PostgreSQL to be ready..."
    # Since we are using python, a simple try-except loop could check the DB, 
    # but for simplicity we'll just run the apply script and let it error if not ready,
    # or rely on docker-compose depends_on healthchecks.
    
    echo "Applying initial schema..."
    python scripts/apply_migration.py || echo "Warning: initial schema failed (might already exist)"

    echo "Running alembic migrations..."
    alembic upgrade head || echo "Warning: alembic upgrade failed"
    
    echo "Seeding data (optional)..."
    python scripts/seed_courses.py || true
    python scripts/seed_mcqs.py || true
fi

# Execute the passed command
exec "$@"
