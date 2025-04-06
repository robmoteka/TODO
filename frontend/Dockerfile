# Etap budowania
FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etap produkcyjny - serwer NGINX
FROM nginx:alpine

# Kopiowanie plików statycznych
COPY --from=build /app/build /usr/share/nginx/html

# Kopiowanie konfiguracji NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
