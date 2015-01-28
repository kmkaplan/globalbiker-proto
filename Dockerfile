## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <n.toublanc@gmail.com>

# update APT
RUN apt-get update && \
    apt-get install -q -y ruby-compass ruby-sass libvips-dev && \
    rm -rf /var/lib/apt/lists/*

RUN gem install --no-ri --no-rdoc compass

WORKDIR /app

ADD . /app

# ADD package.json /app/package.json
RUN npm install --verbose

# ADD bower.json /app/bower.json
RUN bower install --allow-root --config.interactive=false

RUN grunt build:dist --force

RUN chmod 755 /app/scripts/*.sh

ENV MONGOLAB_URI mongodb://mongodb/biketouringmap

VOLUME ["/app/dist/server/upload"]
VOLUME ["/app/dist/server/photos"]
VOLUME ["/app/dist/server/config/environment"]

CMD ["/app/scripts/run.sh"]

# Expose ports.
EXPOSE 8080