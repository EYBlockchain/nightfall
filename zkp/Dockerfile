# Pull in a Zokrates container so that we can pull its contents into the below container.
FROM zokrates/zokrates:0.4.11 as builder

FROM node:11.15
WORKDIR /app
# Copy over Zokrates files into this container
COPY --from=builder /home/zokrates/zokrates /app/zokrates
COPY --from=builder /home/zokrates/.zokrates* /app/stdlib
COPY ./package.json ./package-lock.json ./
RUN npm ci

EXPOSE 80
CMD npm start
