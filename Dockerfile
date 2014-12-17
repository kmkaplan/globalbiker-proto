## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <nicolas.toublanc@gmail.com>

# update APT
RUN apt-get update && \
    apt-get install -q -y ruby-compass ruby-sass libvips-dev && \
    rm -rf /var/lib/apt/lists/*

RUN gem install --no-ri --no-rdoc compass

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install

ADD bower.json /tmp/bower.json
RUN cd /tmp && bower install --allow-root --config.interactive=false

RUN mkdir -p /app && \
    cp -a /tmp/node_modules /app/ && \
    cp -a /tmp/bower_components /app/client/ && \
    rm -rf /tmp/node_modules && \
    rm -rf /tmp/bower_components && \
    rm /tmp/package.json && \
    rm /tmp/bower.json \

WORKDIR /app
ADD . /app

RUN 

RUN grunt build:dist --force

RUN chmod 755 /app/scripts/*.sh

ENV MONGOHQ_URL mongodb://mongodb/biketouringmap

VOLUME ["/app/server/dist/upload"]
VOLUME ["/app/server/dist/photos"]

CMD ["/app/scripts/run.sh"]

# Expose ports.
EXPOSE 8080