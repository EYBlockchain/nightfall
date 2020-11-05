FROM node:14.15

WORKDIR /app

COPY ./package.json ./package-lock.json ./set-env.ts ./
RUN npm ci

EXPOSE 80
CMD npm start
