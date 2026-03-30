# AntiquaChain OpenEnv - Dockerfile
# Hugging Face Spaces default port: 7860

FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer cache)
COPY openenv_env/server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the openenv_env package
COPY openenv_env/ ./openenv_env/
COPY inference.py ./inference.py

# Create outputs directory
RUN mkdir -p outputs/logs outputs/evals

# HF Spaces runs as non-root
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

EXPOSE 7860

ENV PYTHONPATH=/app
ENV PORT=7860

CMD ["uvicorn", "openenv_env.server.app:app", "--host", "0.0.0.0", "--port", "7860"]
