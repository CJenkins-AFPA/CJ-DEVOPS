FROM php:8.2-apache

WORKDIR /var/www/html

RUN apt-get update \
  && apt-get install -y \
     nano \
     vim \
     dos2unix \
     default-mysql-client \
  && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql mysqli \
  && docker-php-ext-enable pdo_mysql mysqli

RUN a2enmod rewrite

# Copie du code applicatif dans le document root
COPY ./web/ /var/www/html/
COPY ./modules/ /var/www/html/modules/
COPY ./files/ /var/www/html/files/

# Nettoyage des fins de lignes éventuelles sur les scripts
RUN find /var/www/html -type f -name "*.sh" -exec dos2unix {} \;

RUN chown -R www-data:www-data /var/www/html

