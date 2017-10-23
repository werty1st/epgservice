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


#logLevel=debug apiclient=${npm_config_apiclient} apisecret=${npm_config_apisecret} apihost=${npm_config_apihost} DB=${npm_config_couchdb}