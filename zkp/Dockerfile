# Pull in a Zokrates container so that we can pull its contents into the below container.
FROM zokrates/zokrates:0.5.1 as builder

FROM node:14.15 as node-build
ARG NPM_TOKEN
WORKDIR /app
COPY ./package.json ./.npmrc ./
RUN npm i
RUN rm -f .npmrc

FROM node:14.15

WORKDIR /app

COPY --from=node-build /app /app

# Copy over Zokrates files into this container
COPY --from=builder /home/zokrates/zokrates /app/zokrates

COPY --from=builder /home/zokrates/.zokrates* /app/stdlib

EXPOSE 80
CMD npm start
