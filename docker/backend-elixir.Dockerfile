FROM elixir:1.15-alpine AS builder

RUN apk add --no-cache \
    build-base \
    git \
    nodejs \
    npm

ENV MIX_ENV=prod

WORKDIR /app

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

RUN if [ -z "$APP_NAME" ]; then \
    echo "ERROR: APP_NAME build argument is required" && exit 1; \
    fi

COPY mix.exs mix.lock ./
COPY config/ ./config/
COPY apps/elixir/ ./apps/elixir/

RUN mix local.hex --force && \
    mix local.rebar --force

RUN mix deps.get --only=prod

RUN mix deps.compile

RUN mix compile

RUN mix release ${APP_NAME}

FROM alpine:3.22 AS runtime

RUN apk add --no-cache \
    openssl \
    ncurses-libs \
    libstdc++ \
    libgcc

RUN addgroup -g 1001 -S elixir && \
    adduser -S -D -H -u 1001 -h /app -s /bin/sh -G elixir elixir

WORKDIR /app

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

COPY --from=builder --chown=elixir:elixir /app/_build/prod/rel/${APP_NAME} ./

USER elixir

CMD ["sh", "-c", "./bin/${APP_NAME} start"]
