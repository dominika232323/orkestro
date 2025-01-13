FROM python:3.13.1
ARG DJANGO_KEY
ENV PYTHONUNBUFFERED=1
COPY . .
RUN pip install -r requirements.txt
RUN python3 manage.py makemigrations
