FROM composer:2 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-progress \
    --no-scripts

FROM node:20-alpine AS node-builder

WORKDIR /app

RUN apk add --no-cache \
    php84 \
    php84-phar \
    php84-mbstring \
    php84-openssl \
    php84-pdo \
    php84-pdo_mysql \
    php84-tokenizer \
    php84-xml \
    php84-ctype \
    php84-session \
    php84-dom \
    php84-fileinfo

RUN ln -sf /usr/bin/php84 /usr/bin/php

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=composer-builder /app/vendor /app/vendor

RUN npm run build:ssr

FROM node:20-alpine

WORKDIR /app

COPY --from=node-builder /app/bootstrap/ssr /app/bootstrap/ssr

EXPOSE 13714
CMD ["node", "/app/bootstrap/ssr/ssr.mjs"]
