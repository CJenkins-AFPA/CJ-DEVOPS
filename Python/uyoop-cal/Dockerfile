### Stage 1: Build wheels to reduce runtime image size
FROM python:3.13-slim AS builder

WORKDIR /wheels
COPY requirements.txt /wheels/requirements.txt
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/* 
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r /wheels/requirements.txt

### Stage 2: Runtime (non-root)
FROM python:3.13-slim

# Installer uniquement git (pour git actions)
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Copier les wheels et installer
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r /wheels/requirements.txt

# Ajouter un utilisateur non-root
RUN useradd -m -u 10001 appuser
USER appuser
WORKDIR /app

# Copier le code de l'app
COPY . .

# Exposer le port 8000
EXPOSE 8000

# Lancer l'app avec uvicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
