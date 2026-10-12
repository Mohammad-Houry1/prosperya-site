# Build public assets without copying environment files or server secrets.
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_CMS_SUBMISSIONS_ENABLED=true
ARG VITE_API_BASE_URL=
ENV VITE_CMS_SUBMISSIONS_ENABLED=${VITE_CMS_SUBMISSIONS_ENABLED} VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
WORKDIR /build
COPY scripts/verify-public-artifacts.mjs scripts/verify-public-artifacts.mjs
RUN node scripts/verify-public-artifacts.mjs

FROM php:8.4-apache-bookworm AS php-base
RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev libxml2-dev libssl-dev libcurl4-openssl-dev unzip \
    && docker-php-ext-install -j"$(nproc)" mbstring dom curl opcache \
    && pecl install mongodb-2.5.0 \
    && docker-php-ext-enable mongodb \
    && rm -rf /var/lib/apt/lists/* /tmp/pear \
    && a2enmod rewrite

FROM php-base AS backend-build
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /build/backend
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts --no-autoloader
COPY backend/ ./
RUN composer dump-autoload --no-dev --optimize --no-interaction \
    && composer check-platform-reqs --no-dev

FROM php-base AS runtime
WORKDIR /var/www/site/backend
ENV APP_ENV=production APP_DEBUG=false PORT=8080 LOG_CHANNEL=stderr
COPY --from=backend-build /build/backend/ ./
COPY --from=frontend-build /build/frontend/dist/ /var/www/site/frontend/dist/
COPY deploy/docker/ports.conf /etc/apache2/ports.conf
COPY deploy/docker/site.conf /etc/apache2/sites-available/000-default.conf
COPY deploy/docker/php.ini /usr/local/etc/php/conf.d/production.ini
COPY deploy/docker/entrypoint.sh /usr/local/bin/site-entrypoint
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x /usr/local/bin/site-entrypoint
EXPOSE 8080
ENTRYPOINT ["site-entrypoint"]
CMD ["apache2-foreground"]
