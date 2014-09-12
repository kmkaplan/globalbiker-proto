## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <nicolas.toublanc@gmail.com>

# update APT
RUN apt-get update

# install compass
RUN apt-get install -q -y ruby-compass ruby-sass

RUN gem install compass

# install libvips
# RUN apt-get install -q -y libvips-dev

# clean apt
RUN apt-get clean

WORKDIR /app

ADD package.json /app/
RUN npm install

ADD bower.json /app/
RUN bower install --allow-root

ADD . /app
RUN chmod 755 /app/scripts/*.sh
RUN /app/scripts/build.sh

ENV MONGOHQ_URL mongodb://mongodb/biketouringmap

VOLUME ["/app/server/upload"]
VOLUME ["/app/server/photos"]

CMD ["/app/scripts/run.sh"]

# Expose ports.
EXPOSE 8080