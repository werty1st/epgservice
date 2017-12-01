FROM node:8-alpine


WORKDIR /usr/src/app/
COPY ./ /usr/src/app/

RUN npm install --production && cd api; npm install --production


#HEALTHCHECK --interval=1m --timeout=3s \
#    CMD npm run health || exit 1



# build
# docker build -t olympia2017:1.0 .


# rebuild
# docker rmi -f olympia2017:1.0 || true && docker build -t olympia2017:1.0 .

# docker run -it --rm --net=host --env-file .npmrc olympia2017:1.0 npm run docker

# export image
# docker save olympia2017:1.0 | gzip -c > olympia2017.tar.gz

# import image
# docker load < olympia2017.tar.gz


# console setup static port
# docker run -d --restart=unless-stopped -m 128M --link=ecmsdb --name=olympia2017 --env-file .npmrc olympia2017:1.0 npm run docker

# console setup static port external source
# docker run -d --restart=unless-stopped -m 128M --link=ecmsdb --name=olympia2017 --env-file /opt/olympia2017/.npmrc -v /opt/olympia2017/:/usr/src/app/  node:8-alpine npm run docker


#install without custom image
# git checkout
# git submodule update --init --recursive
# docker run -it --rm -w="/workdir/" -v $(pwd):/workdir/ -e http_proxy=$http_proxy -e https_proxy=$http_proxy node:8-alpine npm install
# docker run -it --rm -w="/workdir/" -v $(pwd)/api:/workdir/ -e http_proxy=$http_proxy -e https_proxy=$http_proxy node:8-alpine npm install
# docker run -d --restart=unless-stopped -m 128M --link=ecmsdb --name=olympia2017 --env-file /opt/olympia2017/.npmrc -w="/usr/src/app/" -v /opt/olympia2017/:/usr/src/app/  node:8-alpine npm run docker