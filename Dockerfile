## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <n.toublanc@gmail.com>

# update APT
RUN apt-get update && \
    apt-get install -q -y ruby-compass ruby-sass libvips-dev && \
    rm -rf /var/lib/apt/lists/*

RUN gem install --no-ri --no-rdoc compass

ENV GLOBAL_NPM_PACKAGES bower grunt-cli forever

# install globally via npm
RUN npm install -g $GLOBAL_NPM_PACKAGES

WORKDIR /app

ADD . /app

# ADD package.json /app/package.json
RUN npm install --verbose

# ADD bower.json /app/bower.json
RUN bower install --allow-root --config.interactive=false

RUN grunt build:dist --force

# set mongo URL (using mongodb linked docker container)
ENV MONGOLAB_URI mongodb://mongodb/biketouringmap

VOLUME ["/app/dist/server/upload"]
VOLUME ["/app/dist/server/photos"]
VOLUME ["/app/dist/server/config/environment"]

# production mode
ENV NODE_ENV production
RUN mkdir -p /app/dist/server/logs

# define default command.
CMD forever -l /app/dist/server/logs/server.log -o /app/dist/server/logs/out.log -e /app/dist/server/logs/err.log /app/dist/server/app.js

# Expose ports.
EXPOSE 8080