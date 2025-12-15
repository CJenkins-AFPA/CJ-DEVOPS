FROM php:8.2-apache

WORKDIR /var/www/html

RUN apt-get update \
  && apt-get install -y curl \
  && docker-php-ext-install pdo pdo_mysql \
  && a2enmod rewrite \
  && rm -rf /var/lib/apt/lists/*

# Copier le code applicatif
COPY UyoopApp/public/ /var/www/html/public/
COPY UyoopApp/src/ /var/www/html/src/
COPY UyoopApp/data/ /var/www/html/data/

# Healthcheck HTTP
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Fixer le DocumentRoot sur /public
RUN sed -ri 's#DocumentRoot /var/www/html#DocumentRoot /var/www/html/public#g' /etc/apache2/sites-available/000-default.conf \
 && sed -ri 's#<Directory /var/www/html>#<Directory /var/www/html/public>#' /etc/apache2/sites-available/000-default.conf \
 && sed -ri 's#DocumentRoot /var/www/html#DocumentRoot /var/www/html/public#g' /etc/apache2/sites-available/default-ssl.conf \
 && sed -ri 's#<Directory /var/www/html>#<Directory /var/www/html/public>#' /etc/apache2/sites-available/default-ssl.conf

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD /usr/local/bin/healthcheck.sh

CMD ["apache2-foreground"]
