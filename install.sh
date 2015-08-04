#!/bin/bash

crontab -l | { cat; echo '*/5 * * * * cd "/opt/epgservice/php_upload_script/"; /usr/bin/php mainApp.php > /dev/null'; } | crontab -
crontab -l | { cat; echo '*/5 * * * * cd "*/10 * * * * curl -s -H "Content-Type: application/json" -X POST http://****@localhost:5984/epgservice/_compact > /dev/nulll'; } | crontab -
crontab -l | { cat; echo '*/10 * * * * cd "/opt/epgservice/monitoring"; /usr/bin/php monitorApp.php > /dev/null '; } | crontab -

#apt-get install couchdb php5-cli nginx git php5-curl
#apt-get install php5-json #für ubuntu 13.x