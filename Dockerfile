FROM node:23.11.0-slim

COPY . /app
WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 3001

CMD [ "tail", "-f", "/dev/null" ]