#
# Node.js w/ Bower & Grunt runtime Dockerfile
#
# https://github.com/dockerfile/nodejs-bower-grunt-runtime
#
# inspired by DigitallySeamless/nodejs-bower-grunt-runtime
#

# Pull base image.
FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nicolas Toublanc <n.toublanc@gmail.com>

# install via APT
RUN apt-get update && \
    apt-get install -q -y ruby-compass ruby-sass libvips-dev && \
    rm -rf /var/lib/apt/lists/*

# install via gem
RUN gem install --no-ri --no-rdoc compass

# define working directory (to build app)
WORKDIR /app

# install npm dependencies (dev + prod)
ADD package.json /app/
RUN npm install --dev

# install bower dependencies (prod only)
ADD bower.json /app/
ADD .bowerrc /app/
RUN bower install --production --allow-root --config.interactive=false

# production mode
ENV NODE_ENV production

# buid application
ADD . /app
RUN grunt build:dist

# define working directory (to run app)
WORKDIR /app/dist

# set mongo URL (using mongodb linked docker container)
ENV MONGOLAB_URI mongodb://mongodb/biketouringmap

VOLUME ["/app/server/dist/upload"]
VOLUME ["/app/server/dist/photos"]

# define default command.
CMD ["npm", "start"]

# Expose ports.
EXPOSE 8080
