# Use an official Python runtime as a parent image, using the slim variant for smaller images
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create the application directory inside the container
RUN mkdir /app

# Set the working directory
WORKDIR /app

# Install system dependencies if necessary (e.g., for database drivers like psycopg2)
# The packages will vary depending on your specific needs
# Example for PostgreSQL:
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev build-essential

# Install Python dependencies first for better Docker caching
# This step only rebuilds if requirements.txt changes
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Expose port 8000
EXPOSE 8000

# Run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]