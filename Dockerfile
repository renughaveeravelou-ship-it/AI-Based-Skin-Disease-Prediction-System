# Use official slim Python image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TF_CPP_MIN_LOG_LEVEL=3 \
    TF_ENABLE_ONEDNN_OPTS=0

# Set working directory
WORKDIR /app

# Install system dependencies needed for OpenCV, PIL, and general builders
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libpng-dev \
    libjpeg-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first for caching
COPY requirements.txt /app/

# Install Python packages
# Note: we use --no-cache-dir to keep the image compact
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy current folder into container /app
COPY . /app/

# Create folders for uploads and ensure proper permissions
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Expose Flask default port
EXPOSE 5000

# Run Flask using WSGI server gevent as specified in requirements
CMD ["python", "app.py"]
