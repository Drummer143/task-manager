FROM rust:1.91.1 AS builder

ARG APP_NAME
ARG PROFILE=release

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY apps/backend/ ./apps/backend/
COPY libs/ ./libs/

RUN cargo build -p ${APP_NAME} --profile ${PROFILE}

FROM rust:1.91.1 as runner

ARG APP_NAME
ARG PROFILE=release

WORKDIR /app

COPY --from=builder /app/target/${PROFILE}/${APP_NAME} ./${APP_NAME}

COPY migrations/ ./migrations/

ENV MIGRATIONS_DIR=/app/migrations

RUN echo "#!/bin/sh\n./${APP_NAME}" > entrypoint.sh

RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
