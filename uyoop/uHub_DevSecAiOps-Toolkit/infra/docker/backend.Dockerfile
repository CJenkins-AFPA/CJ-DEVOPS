# Requires 'docker login dhi.io'
FROM dhi.io/python:3.13-dev

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

# Copy configuration
COPY backend/alembic.ini .

# Copy application code
COPY backend/app ./app

# Fix permissions for nonroot
RUN chown -R nonroot:nonroot /app /app/alembic.ini

# Switch to non-root user (provided by Wolfi/Chainguard)
USER nonroot

# Expose port
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
