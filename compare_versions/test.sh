#!/bin/bash

mkdir old
mkdir new

#load new file
wget -nv -O new/zdf.xml http://localhost:5984/epgservice/_design/epgservice/_rewrite/v2/zdf/today/xml > /dev/null 2>&1
#load old file
wget -nv -O old/zdf.xml http://sofa01.zdf.de/epgservice/_design/epgservice/_rewrite/v2/zdf/today/xml > /dev/null 2>&1

#load new file
wget -nv -O new/neo.xml http://localhost:5984/epgservice/_design/epgservice/_rewrite/v2/zdfneo/today/xml > /dev/null 2>&1
#load old file
wget -nv -O old/neo.xml http://sofa01.zdf.de/epgservice/_design/epgservice/_rewrite/v2/zdfneo/today/xml > /dev/null 2>&1

#load new file
wget -nv -O new/kultur.xml http://localhost:5984/epgservice/_design/epgservice/_rewrite/v2/zdfkultur/today/xml > /dev/null 2>&1
#load old file
wget -nv -O old/kultur.xml http://sofa01.zdf.de/epgservice/_design/epgservice/_rewrite/v2/zdfkultur/today/xml > /dev/null 2>&1

#load new file
wget -nv -O new/info.xml http://localhost:5984/epgservice/_design/epgservice/_rewrite/v2/zdfinfo/today/xml > /dev/null 2>&1
#load old file
wget -nv -O old/info.xml http://sofa01.zdf.de/epgservice/_design/epgservice/_rewrite/v2/zdfinfo/today/xml > /dev/null 2>&1

#load new file
wget -nv -O new/3sat.xml http://localhost:5984/epgservice/_design/epgservice/_rewrite/v2/3sat/today/xml > /dev/null 2>&1
#load old file
wget -nv -O old/3sat.xml http://sofa01.zdf.de/epgservice/_design/epgservice/_rewrite/v2/3sat/today/xml > /dev/null 2>&1

#load new file
wget -nv -O new/kika.xml http://localhost:5984/epgservice/_design/epgservice/_rewrite/v2/kika/today/xml > /dev/null 2>&1
#load old file
wget -nv -O old/kika.xml http://sofa01.zdf.de/epgservice/_design/epgservice/_rewrite/v2/kika/today/xml > /dev/null 2>&1

#load new file
wget -nv -O new/arte.xml http://localhost:5984/epgservice/_design/epgservice/_rewrite/v2/arte/today/xml > /dev/null 2>&1
#load old file
wget -nv -O old/arte.xml http://sofa01.zdf.de/epgservice/_design/epgservice/_rewrite/v2/arte/today/xml > /dev/null 2>&1

#compare
meld old new
