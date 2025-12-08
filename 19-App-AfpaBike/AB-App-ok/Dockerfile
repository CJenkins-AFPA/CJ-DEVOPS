FROM php:8.2-apache
 
# Installer les paquets nécessaires, y compris nano
RUN apt-get update && apt-get install -y nano openssh-server vim dos2unix netcat-traditional

# Installation des extensions PHP nécessaires
RUN docker-php-ext-install mysqli pdo pdo_mysql
RUN docker-php-ext-enable pdo_mysql mysqli
RUN apt-get install -y default-mysql-client

# Activation de modules Apache : réécriture d'URL
RUN a2enmod rewrite

# création de dossiers
# Ne fonctionne pas. Ajout dans les volumes du docker-compose.yml
#RUN mkdir /var/www/modules/
#RUN mkdir /var/www/files/

# Copies des dossiers et fichiers du projet
COPY ./modules/ /var/www/modules/
COPY ./files/ /var/www/files/
COPY ./web/ /var/www/html/
# Copie du fichier de configuration
COPY ./config_afpabike_dev.ini /var/www/files/config_afpabike_dev.ini
# Copie du dump de la base de données dans le dossier 
COPY ./Crebas_AfpaBike_v1-1_with_values.sql /docker-entrypoint-initdb.d/Crebas_AfpaBike_v1-1_with_values.sql

# Cette commande ne fonctionne pas :
# Mais elle fonctionne manuellement dans le terminal
# obligé de préciser l'IP du container db
# RUN mysql -h 172.18.0.2 -P 3306 --protocol=tcp -uafpabike -pafpabike gestion_afpabike_db < /var/www/files/Crebas_AfpaBike_v1-1_with_values.sql

# Du coup, injection de la base via docker-compose.yml, dans le volume
# Seul root peut manipuler, alors qu'il faut que cela soit l'utilisateur afpabike sur sa base de données gestion_afpabike_db
COPY ./grant_bdd.sql /var/www/files/grant_bdd.sql
COPY ./grant_bdd.sh /var/www/files/grant_bdd.sh
RUN chmod +x /var/www/files/grant_bdd.sh
RUN dos2unix /var/www/files/grant_bdd.sh

# Cela plante, cela ne peut pas se connecter à MySQL, malgré un sleep de 10 secondes
# Alors que ce script, lancé à la main fonctionne, et donne bien les droits à l'utilisateur afpabike sur sa base gestion_afpabike_db
# J'ai également essayé dans le docker-compose de faire un wait des conteneurs, ou un depends_on 
# et d'utiliser netcat pour tester si la BDD était ON, mais hélas ...
#CMD ["/var/www/files/grant_bdd.sh"]


