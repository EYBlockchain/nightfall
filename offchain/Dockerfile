FROM node:14.15 as node-build
ARG NPM_TOKEN
WORKDIR /app
COPY ./package.json ./package-lock.json ./.npmrc ./
RUN npm ci
RUN rm -f .npmrc

FROM node:14.15

WORKDIR /app

COPY --from=node-build /app /app

EXPOSE 80
CMD npm start
