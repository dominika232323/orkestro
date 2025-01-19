# Orkestro
## Cel projektu
Celem projektu jest stworzenie aplikacji ułatwiającej kierownikom grup muzycznych zarządzanie swoimi zespołami, przekazywanie muzykom informacji dotyczących funkcjonowania grupy oraz bezpieczną dystrybucję nut i innych wykorzystywanych plików.

## Zmienne środowiskowe
Przykładowy plik `.env` w katalogu głównym projektu:

```sh
# Database - general
POSTGRES_DB=orkestrodb
INCLUDE_TEST_DATA=true

# Master database; in HOST fields use local address (192.168.x.x) rather than localhost
POSTGRES_MASTER_USER=myuser
POSTGRES_MASTER_PASSWORD=[password]
POSTGRES_MASTER_HOST=192.168.0.100
POSTGRES_MASTER_PORT=5432

# Slave database - if unused, leave parameters the same as in master
POSTGRES_SLAVE_USER=myuser_slave
POSTGRES_SLAVE_PASSWORD=[password]
POSTGRES_SLAVE_HOST=192.168.0.100
POSTGRES_SLAVE_PORT=5433

# Django-specific parameters
DJANGO_KEY=[key]
DJANGO_DEBUG=true
DJANGO_WORKERS=3
DOMAIN=orkestro.ddns.net
IP=localhost

# Email sending
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER=[SMTP user]
EMAIL_PASSWORD=[SMTP password]

# Other
BACKEND_HOSTS="192.168.0.100:8000"
REACT_APP_GOOGLE_CLIENT_ID=[Google API client ID]
GOOGLE_CLIENT_SECRET=[Google API client secret]
USE_HTTPS=false
BROWSER=none

# The deployment script can overwrite IP values below


```

# Uruchomienie (wersja deweloperska, bez wszystkich kontenerów)

## Baza danych PostgreSQL
### Pierwsze uruchomienie
```sh
cd deployment/deploy
sudo ./setup_master.sh
```

Na Windowsie można wykonać komendy Dockerowe zawarte w skrypcie. Kontener wykonujący migrację może się kilkukrotnie zrestartować przed uzyskaniem połączenia z bazą danych.

### Następne uruchomienia
```sh
docker compose up orkestro-db-master
```

## Django backend (`backend/`)
### Instalacja zależności
```sh
pip install -r requirements.txt
```

### Pierwsze uruchomienie
```sh
python manage.py makemigrations
python manage.py createsuperuser
```

### Serwer deweloperski
```sh
python manage.py runserver 0.0.0.0:8000
```

Serwer słucha na: <http://localhost:8000/>

### Testy z pokryciem linii i gałęzi
```sh
coverage run manage.py test --keepdb
coverage report -m
coverage run --branch manage.py test --keepdb
coverage report -m
```

## React.js frontend (`frontend/`)
### Instalacja zależności
```sh
npm install
```

### Serwer deweloperski
```sh
npm start
```

Serwer słucha na: <http://localhost:3000/>

## NGINX
### Uruchomienie
```sh
docker compose up orkestro-nginx-dev
```

Aplikacja dostępna jest na: <http://localhost:5000/>

Panel administratora: <http://localhost:5000/admin/>
