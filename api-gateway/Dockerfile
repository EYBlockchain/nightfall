FROM node:11.15

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci

EXPOSE 80
CMD npm start
