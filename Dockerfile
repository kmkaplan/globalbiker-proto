# Pull base image.
FROM nodesource/node:jessie

MAINTAINER Nicolas Toublanc <n.toublanc@gmail.com>

ENV APT_PACKAGES ruby-compass ruby-sass libvips-dev

# install via APT
RUN apt-get update && \
    apt-get install -q -y $APT_PACKAGES && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# define working directory (to build app)
WORKDIR /app

ENV GLOBAL_NPM_PACKAGES bower grunt-cli forever

# install globally via npm
RUN npm install -g $GLOBAL_NPM_PACKAGES

ENV NPM_PACKAGES express phantomjs lwip socket.io socket.io-client mongoose grunt-contrib-imagemin grunt-node-inspector

RUN npm -g install npm@next

# install via npm
RUN npm install $NPM_PACKAGES

# install npm dependencies
ADD package.json /app/
RUN npm install

# install bower dependencies
ADD bower.json /app/
ADD .bowerrc /app/
RUN bower install --allow-root --config.interactive=false

RUN ls -la

# buid application
ADD . /app

RUN ls -la

RUN ls -la node_modules

RUN grunt build:dist

# define working directory (to run app)
WORKDIR /app/dist

# set mongo URL (using mongodb linked docker container)
ENV MONGOLAB_URI mongodb://mongodb/biketouringmap

# production mode
ENV NODE_ENV production

RUN mkdir -p /app/dist/server/logs

# define default command.
CMD forever -l /app/dist/server/logs/server.log -o /app/dist/server/logs/out.log -e /app/dist/server/logs/err.log /app/dist/server/app.js

# Expose ports.
EXPOSE 8080