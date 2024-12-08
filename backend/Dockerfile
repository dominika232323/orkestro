FROM python:3.13

WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "orkestro.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]