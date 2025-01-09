FROM python:3.13.1 AS django_admin
COPY backend backend
RUN pip install -r backend/requirements.txt
RUN python3 backend/manage.py collectstatic --noinput

FROM node:18 AS frontend
COPY frontend frontend
WORKDIR frontend
RUN npm install
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=django_admin backend/static-django /usr/share/nginx/html/static-django
COPY --from=frontend frontend/build/* /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
