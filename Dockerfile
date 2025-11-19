FROM golang:1.25

ENV FTT_API_PORT=":8000"
ENV FTT_API_SQL_MIGRATIONS_LOCATION="file://migrations"
ENV GIN_MODE=release

WORKDIR /fttapi

COPY . .
RUN go mod download
RUN make build

CMD ["target/fttapi-svc"]

EXPOSE 8000