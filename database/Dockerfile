FROM node:14.15 as node-build
ARG NPM_TOKEN
WORKDIR /app
COPY ./package.json ./package-lock.json ./.npmrc ./
RUN npm ci
RUN rm -f .npmrc

FROM node:14.15

WORKDIR /app

COPY --from=node-build /app /app

# Install mongodb
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add -
RUN echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.2 main" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list
RUN apt-get update
RUN apt-get install -y mongodb-org-shell=4.2.10

EXPOSE 80
