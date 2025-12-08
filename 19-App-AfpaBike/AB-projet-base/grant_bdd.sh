#!/bin/bash

sleep 10

mysql -h 172.18.0.2 -P 3306 --protocol=tcp -uroot -proot < /var/www/files/grant_bdd.sql
