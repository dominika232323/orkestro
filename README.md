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
DJANGO_DEBUG=0
REACT_APP_GOOGLE_CLIENT_ID=[Google API client ID]
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
python manage.py runserver
```

Serwer jest dostępny na: <http://localhost:8000/>

Przykładowa strona: <http://localhost:8000/admin/>

## React.js frontend (`frontend/`)
### Instalacja zależności
```sh
npm install
```

### Serwer deweloperski
```sh
npm start
```

Strona jest dostępna na: <http://localhost:3000/>
