FROM node:22.11.0-alpine3.20
LABEL org.opencontainers.image.source="https://github.com/MrMohebi/stremio-ir-providers"

WORKDIR /home/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]