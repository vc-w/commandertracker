FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY app ./app

# Expose FastAPI port
EXPOSE 8000

# Initialize DB and start FastAPI
CMD ["bash", "-c", "python app/database.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
