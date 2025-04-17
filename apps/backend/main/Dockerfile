FROM golang:1.23.1 AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go install github.com/swaggo/swag/cmd/swag@latest

RUN swag init

RUN CGO_ENABLED=0 GOOS=linux go build -o main

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/main ./

COPY --from=builder /app/docs ./docs

COPY --from=builder /app/.env.docker ./.env

COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./main"]