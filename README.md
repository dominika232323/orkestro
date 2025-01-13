# Orkestro
## Cel projektu
Celem projektu jest stworzenie aplikacji ułatwiającej kierownikom grup muzycznych zarządzanie swoimi zespołami, przekazywanie muzykom informacji dotyczących funkcjonowania grupy oraz bezpieczną dystrybucję nut i innych wykorzystywanych plików.

## Zmienne środowiskowe
Przykładowy plik `.env` w katalogu głównym projektu:

```sh
# Database - general
POSTGRES_DB=orkestrodb
INCLUDE_TEST_DATA=true

# Master database; in HOST use local address (192.168.x.x) rather than localhost
POSTGRES_MASTER_USER=myuser
POSTGRES_MASTER_PASSWORD=[password]
DJANGO_DB_MASTER_HOST=192.168.0.100
DJANGO_DB_MASTER_PORT=5432

# Slave database - if unused, leave parameters the same as in master
POSTGRES_SLAVE_USER=myuser_slave
POSTGRES_SLAVE_PASSWORD=[password]
DJANGO_DB_SLAVE_HOST=192.168.0.100
DJANGO_DB_SLAVE_PORT=5433

# Django-specific parameters
DJANGO_KEY=[key]
DJANGO_DEBUG=1
DOMAIN=orkestro.ddns.net
IP=localhost

# Other
REACT_APP_GOOGLE_CLIENT_ID=[Google API client ID]
BROWSER=none

# The deployment script can overwrite IP values below

```

# Uruchomienie (wersja deweloperska, bez wszystkich kontenerów)

## Baza danych PostgreSQL (`database/`)
### Uruchomienie
```sh
docker compose up
```

### Wypełnienie przykładowymi danymi
```sh
docker cp tables.sql orkestro-db:/
docker cp data.sql orkestro-db:/
docker exec -it orkestro-db psql -U myuser -d orkestrodb -f /tables.sql
docker exec -it orkestro-db psql -U myuser -d orkestrodb -f /data.sql
docker exec -it orkestro-db psql -U myuser -d orkestrodb -c "CREATE DATABASE test_orkestrodb;"
docker exec -it orkestro-db psql -U myuser -d test_orkestrodb -f /tables.sql

```

## Django backend (`backend/`)
### Instalacja zależności
```sh
pip install -r requirements.txt
```

### Pierwsze uruchomienie
```sh
python manage.py makemigrations
python manage.py migrate
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

## Nginx (`nginx/`)
### Uruchomienie
```sh
docker compose up
```

Aplikacja dostępna jest na: <http://localhost:5000/>

Przykładowe strony:

- <http://localhost:5000/>
- <http://localhost:5000/admin/>
- <http://localhost:5000/test/> (tymczasowa strona z testami API i logowaniem Google)
