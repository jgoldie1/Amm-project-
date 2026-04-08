FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install flask gunicorn psycopg2-binary stripe twilio
EXPOSE 8080
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "app:app"]
