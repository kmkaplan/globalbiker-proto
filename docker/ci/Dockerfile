## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <nicolas.toublanc@gmail.com>

# update APT
RUN apt-get update

# install compass
RUN apt-get install -q -y ruby-compass ruby-sass

RUN gem install compass

# install libvips
RUN apt-get install -q -y libvips-dev

# clean apt
RUN apt-get clean

WORKDIR /app

# Add scripts
ADD build.sh /scripts/build.sh
ADD run.sh /scripts/run.sh
RUN chmod 755 /scripts/*.sh

ADD ../.. /app
RUN /scripts/build.sh

ENV MONGOHQ_URL mongodb://mongodb/biketouringmap

# Expose ports.
EXPOSE 8080

# volumes
VOLUME  ["/deploy", "/app"]

CMD ["/scripts/run.sh"]
