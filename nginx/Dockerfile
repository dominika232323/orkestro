FROM python:3.13.1 AS django_admin

COPY backend backend

RUN pip install -r backend/requirements.txt
RUN python3 backend/manage.py collectstatic --noinput



FROM node:18 AS frontend

ARG REACT_APP_GOOGLE_CLIENT_ID

COPY frontend frontend

WORKDIR frontend
RUN npm install
RUN npm run build



FROM nginx:1.27-alpine

ARG USE_HTTPS
ARG BACKEND_HOSTS

COPY --from=django_admin backend/static-django /usr/share/nginx/html/static-django
COPY --from=frontend frontend/build/* /usr/share/nginx/html
COPY nginx/chain.pem /etc/nginx/conf.d/chain.pem
COPY nginx/privkey.pem /etc/nginx/conf.d/privkey.pem
COPY nginx/fullchain.pem /etc/nginx/conf.d/fullchain.pem
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

RUN for host in $BACKEND_HOSTS; do sed -i "2i server ${host};" /etc/nginx/conf.d/default.conf ; done
RUN if [ "$USE_HTTPS" == "true" ] ; \
    then sed -i 's/listen 5000;//g' /etc/nginx/conf.d/default.conf ; \
         sed -i 's/#//g' /etc/nginx/conf.d/default.conf ; \
    fi

CMD ["nginx", "-g", "daemon off;"]
