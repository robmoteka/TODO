# TODO App

Aplikacja webowa i mobilna do zarządzania zadaniami, umożliwiająca śledzenie problemów i ich rozwiązań, z możliwością monitorowania procesu realizacji.

## Struktura projektu

- **/docs** - dokumentacja projektu
- **/backend** - API serwera (Node.js + Express + MongoDB)
- **/frontend** - aplikacja webowa (React + TypeScript)
- **/mobile** - aplikacja mobilna (React Native)

## Wymagania

- Docker i Docker Compose
- Node.js 18+
- MongoDB
- Git

## Uruchamianie w środowisku deweloperskim

```bash
# Klonowanie repozytorium
git clone [adres-repozytorium]
cd TODO

# Uruchamianie za pomocą Docker Compose
docker-compose up -d

# Bez Dockera - backend
cd backend
npm install
npm run dev

# Bez Dockera - frontend
cd frontend
npm install
npm start
```

## Wdrażanie na VPS

```bash
# Na serwerze VPS
git clone [adres-repozytorium]
cd TODO
docker-compose -f docker-compose.prod.yml up -d
```

## Dostępne skrypty

- `npm run dev` - uruchomienie w trybie deweloperskim
- `npm run build` - budowanie aplikacji
- `npm test` - uruchomienie testów
- `npm run deploy` - wdrożenie na serwer

## Dokumentacja API

Dokumentacja API jest dostępna pod adresem [http://localhost:3000/api/docs](http://localhost:3000/api/docs) po uruchomieniu backendu.
