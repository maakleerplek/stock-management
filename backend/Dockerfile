# Stage 1: Build the Python application
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential
RUN pip install --upgrade pip

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt > pip_wheel.log 2>&1 || (cat pip_wheel.log && exit 1)

# Stage 2: Create the final image
FROM python:3.11-slim-bookworm

WORKDIR /app

# Copy installed dependencies from the builder stage
COPY --from=builder /app/wheels /wheels

# Install dependencies from wheels
RUN pip install --no-index --find-links=/wheels /wheels/*

# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "main:app"]
