## Adapted from https://github.com/dockerfile/nodejs-bower-grunt-runtime
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <nicolas.toublanc@gmail.com>

# update APT
RUN apt-get update

# install compass
RUN apt-get install -q -y ruby-compass ruby-sass

RUN gem install compass

# clean apt
RUN apt-get clean

WORKDIR /app

# Add scripts
ADD build-app.sh /scripts/build-app.sh
ADD start-app.sh /scripts/start-app.sh
ADD run.sh /scripts/run.sh
RUN chmod 755 /scripts/*.sh

ENV MONGOHQ_URL mongodb://mongodb/biketouringmap

# Expose ports.
EXPOSE 8080

# volumes
VOLUME  ["/app"]

CMD ["/scripts/run.sh"]
