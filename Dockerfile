### Build Back-End ###

FROM rust:1.73-slim-buster as rustbuild

WORKDIR /findtheti-me

COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml
COPY ./src ./src
COPY ./.sqlx ./.sqlx
COPY ./migrations ./migrations

RUN cargo build --release

### Build Front-End ###

FROM node:21 as nodebuilder

WORKDIR /app

COPY ./frontend ./

RUN yarn install --prefer-offline --frozen-lockfile --non-interactive

ENV NODE_ENV=production

RUN yarn build

RUN rm -rf node_modules

### Combine Both Into Running Image ###

FROM rust:1.73-slim-buster

RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  --uid "10001" \
  appuser

COPY --from=rustbuild /findtheti-me/target/release/findtheti-me ./findtheti-me/

RUN chown appuser ./findtheti-me/findtheti-me

COPY --from=nodebuilder /app/dist ./findtheti-me/frontend/dist

RUN chown -R appuser ./findtheti-me

USER appuser

ENV LOG_LEVEL=info
ENV EVENT_UID_SIZE=20

ENV HTTP_PORT=8080

ENV SSL_ENABLED=false
ENV SSL_REDIRECT=true
ENV SSL_PORT=8443
ENV SSL_CERT_PATH=/etc/findtheti-me/certs/server.cert
ENV SSL_KEY_PATH=/etc/findtheti-me/certs/server.key

WORKDIR ./findtheti-me

CMD ["./findtheti-me"]