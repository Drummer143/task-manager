FROM golang:1.23.1 AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go install github.com/swaggo/swag/cmd/swag@latest

RUN swag init

RUN CGO_ENABLED=0 GOOS=linux go build -o storage

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/storage ./

COPY --from=builder /app/docs ./docs

COPY --from=builder /app/.env ./.env

EXPOSE 8082

CMD ["./storage"]