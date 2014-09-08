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
 
# Define working directory.
WORKDIR /app

# Set instructions on build.
ADD package.json /app/
RUN npm install

ADD bower.json /app/
RUN bower install --allow-root

ADD . /app
RUN grunt build

WORKDIR /app/dist

ENV NODE_ENV production
ENV MONGOHQ_URL mongodb://mongodb/biketouringmap

# Define default command.
CMD ["npm", "start"]
# Expose ports.
EXPOSE 8080

