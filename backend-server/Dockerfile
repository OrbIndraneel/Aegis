# Production Dockerfile for Disaster Management AI Platform Backend
FROM python:3.11-slim

# Prevent Python from writing bytecode and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for GeoPandas & PostGIS (GDAL, GEOS, PROJ, libpq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gdal-bin \
    libgdal-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies list and install CPU-only PyTorch first to minimize memory footprint
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose default HTTP port
EXPOSE 8000

# Start lightweight Uvicorn server bound directly to dynamic cloud PORT
CMD ["sh", "-c", "exec uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
