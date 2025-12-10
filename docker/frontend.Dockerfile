FROM node:25 AS builder

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY . .

ARG APP_NAME

RUN pnpm exec nx run ${APP_NAME}:build

FROM nginx:1.18 AS runner

ARG APP_NAME

COPY --from=builder /app/dist/apps/frontend/${APP_NAME}/ /usr/share/nginx/html/

COPY ./docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
