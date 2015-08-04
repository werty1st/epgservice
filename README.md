epgservice
==========


TODO

Header werden zur Zeit auf jede Datei mit maxage=300 gesetzt.
Monitoring

vHost setup
===========

NGINX:

server {
 listen 80;
 server_name epg.sofa02.zdf.de;

 rewrite  /crossdomain.xml  /epgservice/crossdomain.xml;


 location / {
         proxy_pass http://127.0.0.1:5984/;
         include /etc/nginx/proxy_params;
         proxy_set_header Host "epg.sofa02";
 }
}

couchdb local.ini:
[vhosts]
epg.sofa02 = /epgservice/_design/epgservice/_rewrite


couchdb config:5984/_utils/config.html
section
	vhosts
entry	
	epg.sofa02	/epgservice/_design/epgservice/_rewrite

hosts:
127.0.0.1       localhost epg.sofa02


I have my web site run out of a Couch DB instance, so I have my vhost configured to point to /dbname/_design/app/_rewrite.

I want to be able to access the index page from a web browser, while still accessing the Couch DB API over Ajax, so I set up a pair of rewrite rules in my rewrites field:

[ { "from": "/dbname/*", "to: ../../*" },
  { "from": "/*", "to: *" } ]