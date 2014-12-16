## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <nicolas.toublanc@gmail.com>

# update APT
RUN apt-get update && \
    apt-get install -q -y ruby-compass ruby-sass libvips-dev && \
    apt-get clean

RUN gem install --no-ri --no-rdoc compass

WORKDIR /.build-tmp

# pre-install main dependencies (to save time)
RUN npm install karma karma-phantomjs-launcher grunt-contrib-imagemin grunt-google-cdn grunt-protractor-runner lwip express

# ADD package.json /app/
RUN npm install --verbose
# RUN npm install

# ADD bower.json /app/
RUN bower install --allow-root --config.interactive=false

WORKDIR /app

ADD . /app
RUN mv /.build-tmp/node_modules /app
RUN mv /.build-tmp/bower_components /app/client/

RUN grunt build:dist --force

# RUN chmod 755 /app/scripts/*.sh
# RUN /app/scripts/build.sh

ENV MONGOHQ_URL mongodb://mongodb/biketouringmap

VOLUME ["/app/server/dist/upload"]
VOLUME ["/app/server/dist/photos"]

CMD ["/app/scripts/run.sh"]

# Expose ports.
EXPOSE 8080