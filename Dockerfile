FROM node:16.17-alpine3.15

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5432
EXPOSE 8080
ENV TOKEN="MTAxMTM5MjIwODU0MjM4ODMyNQ.Gj7epz.GcguLkLWKa3-CxBfuTRa07Y7zrs2-YT3ltcnh0"
ENV GUILD_ID="780353913559449621"
ENV CLIENT_ID="1011392208542388325"

RUN npm run start