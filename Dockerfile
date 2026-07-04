# Stage 1: Build the Vite React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve using PHP 8.2 with Apache
FROM php:8.2-apache

# Install SQLite dependencies and build tools
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory to Apache document root
WORKDIR /var/www/html

# Copy root index.php router
COPY index.php ./

# Copy api folder (containing PHP scripts and seeded SQLite database)
COPY api/ ./api/

# Copy compiled static frontend assets from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Set correct read/write permissions for Apache (www-data) on SQLite database file and directories
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 775 /var/www/html/api

# Expose Apache default port
EXPOSE 80

# Apache runs in foreground by default
CMD ["apache2-foreground"]
