# Orkestro
## Cel projektu
Celem projektu jest stworzenie aplikacji ułatwiającej kierownikom grup muzycznych zarządzanie swoimi zespołami, przekazywanie muzykom informacji dotyczących funkcjonowania grupy oraz bezpieczną dystrybucję nut i innych wykorzystywanych plików.

## Zmienne środowiskowe
Przykładowy plik `.env` w katalogu głównym projektu:

```sh
POSTGRES_USER=myuser
POSTGRES_PASSWORD=[password]
POSTGRES_DB=orkestrodb
DJANGO_DB_HOST=localhost
DJANGO_DB_PORT=5432
DJANGO_KEY=[key]
DJANGO_DEBUG=1
REACT_APP_GOOGLE_CLIENT_ID=[Google API client ID]
BROWSER=none
```


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
