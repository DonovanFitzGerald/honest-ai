# ── Stage 1: Composer deps ──────────────────────────────────
FROM composer:2 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-progress \
    --no-scripts


# ── Stage 2: Node build with PHP CLI available ──────────────
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


# ── Stage 3: PHP app ────────────────────────────────────────
FROM php:8.2-fpm-alpine AS app

RUN apk add --no-cache \
    bash curl zip unzip git \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    oniguruma-dev libxml2-dev \
    && docker-php-ext-install \
        pdo_mysql mbstring exif pcntl bcmath gd opcache

WORKDIR /var/www

COPY . .
COPY --from=composer-builder /app/vendor /var/www/vendor
COPY --from=node-builder /app/public/build /var/www/public/build
COPY --from=node-builder /app/bootstrap/ssr /var/www/bootstrap/ssr

RUN mkdir -p storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    bootstrap/cache \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
