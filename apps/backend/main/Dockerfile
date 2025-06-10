FROM rust:1.86 AS builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

RUN cargo fetch

COPY . .

RUN cargo build --release

FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
    libc6 \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root/

COPY --from=builder /app/target/release/main ./
COPY --from=builder /app/.env.docker ./.env
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./main"]
