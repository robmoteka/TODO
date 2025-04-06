# Etap budowania
FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etap produkcyjny
FROM node:18-alpine

WORKDIR /app

# Kopiowanie plików produkcyjnych
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./

# Instalacja tylko produkcyjnych zależności
RUN npm ci --only=production

# Ustawienie użytkownika systemowego node
USER node

# Ujawnienie portu API
EXPOSE 3000

CMD ["node", "dist/app.js"]
