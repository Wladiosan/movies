FROM node:16

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY . /app

RUN npm i

EXPOSE 3000

CMD ["node", "start"]



