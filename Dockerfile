# Build Stage
FROM node:22-alpine AS build

WORKDIR /app

#Kopieren der package.json und package-lock.json und Installation der Abhängigkeiten
COPY package.json package-lock.json* ./
RUN npm ci

#Kopieren des restlichen Quellcodes und Bauen der Applikation
COPY . .
RUN npm run build

#Production Stage
FROM nginxinc/nginx-unprivileged:alpine

#Kopieren der erstellten Datein in das NGINX HTML Verzeichnis
COPY --from=build /app/dist /usr/share/nginx/html

#Kopieren der NGINX Konfigurationsdatei in das entsprechende Verzeichnis (nginx gehört die Datei)
COPY --chown=nginx:nginx nginx.conf /etc/nginx/templates/default.conf.template

#Nginxinc verwendet den Port 8080 für unprivilegierte Container 
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]