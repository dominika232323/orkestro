# Orkestro
## Cel projektu
Celem projektu jest stworzenie aplikacji ułatwiającej kierownikom grup muzycznych zarządzanie swoimi zespołami, przekazywanie muzykom informacji dotyczących funkcjonowania grupy oraz bezpieczną dystrybucję nut i innych wykorzystywanych plików.

## Baza danych PostgreSQL (`database/`)
```sh
docker compose up
```

Baza dostępna jest dostępna na porcie 5432

Użytkownik: `myuser`

Hasło: `mysecretpassword`

## Django backend (`backend/`)
### Instalacja zależności
```sh
pip install -r requirements.txt
```

### Pierwsze uruchomienie
```sh
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
