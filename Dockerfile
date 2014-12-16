## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <nicolas.toublanc@gmail.com>

# update APT
RUN apt-get update && \
    apt-get install -q -y ruby-compass ruby-sass libvips-dev && \
    rm -rf /var/lib/apt/lists/*

RUN gem install --no-ri --no-rdoc compass

WORKDIR /.build-tmp

# pre-install main dependencies (to save time)
RUN npm install karma karma-phantomjs-launcher grunt-contrib-imagemin grunt-google-cdn grunt-protractor-runner lwip express

RUN mkdir /.build-tmp

ADD package.json /.build-tmp
RUN npm install --verbose
# RUN npm install

ADD bower.json /.build-tmp
RUN bower install --allow-root --config.interactive=false

WORKDIR /app

ADD . /app
RUN mv /.build-tmp/node_modules /app
RUN mv /.build-tmp/bower_components /app/client/

RUN rm -r /.build-tmp

RUN grunt build:dist --force

# RUN chmod 755 /app/scripts/*.sh
# RUN /app/scripts/build.sh

ENV MONGOHQ_URL mongodb://mongodb/biketouringmap

VOLUME ["/app/server/dist/upload"]
VOLUME ["/app/server/dist/photos"]

CMD ["/app/scripts/run.sh"]

# Expose ports.
EXPOSE 8080