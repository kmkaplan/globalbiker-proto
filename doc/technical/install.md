# Installation

Note: the current documentation is in progress: use it at your own risks.

## Get sources

Clone the sources using git:

    git clone https://github.com/GlobalBiker/globalbiker-web.git

## Method 1: Manual install

NOTE: This is the recommand method until Docker build is back.

### Pre-requisites

Install [MongoDB 2.8](https://www.mongodb.org)

Install [NodeJS](https://nodejs.org)

Install grunt globally:

    npm install -g grunt-cli

Install bower globally:

    npm install -g bower
    
### Install dependencies

Install NPM dependencies from project directory:

    npm install
    
Then, install bower dependencies:

    bower install
    
### Configure application

TODO

### Launch application

    grunt serve
    
## Method 2: Docker

### Pre-requisites

If you are already familiar with Docker, this is the recommanded approach. Else, use the manual install.

You may already have docker & docker-compose running on your machine.

WARNING: the following doc is not up to date: please use manual installation.

#### Docker build

Build the docker image from sources:  
    
    sudo docker build -t="globalbiker/bike-touring-map" .
    
#### Pre-requisites

Run a mongoDB image with shared directory:

    mkdir -p /opt/docker/mongodb/data

    sudo docker run -d \
        -p 27019:27017 \
        -v /opt/docker/mongodb/data:/data/db \
        --name mongodb dockerfile/mongodb
   
#### Test the image

    sudo docker run --rm -i \
        --link=mongodb:mongodb \
        -p 8080:8080 \
        -t globalbiker/bike-touring-map /bin/bash
   
#### Run application

Create shared directories to avoid loosing your data:

    mkdir -p /opt/docker/jenkins/share/globalbiker.org/upload
    mkdir -p /opt/docker/jenkins/share/globalbiker.org/photos

Start a new container

    docker run -d \
        --link=mongodb:mongodb \
        --volume=/opt/docker/jenkins/share/globalbiker.org/upload:/app/dist/server/upload \
        --volume=/opt/docker/jenkins/share/globalbiker.org/photos:/app/dist/server/photos \
        --volume=/opt/docker/jenkins/share/globalbiker.org/environments:/app/dist/server/config/environments \
        -p 9209:8080 \
        --name globalbiker.org -t globalbiker/bike-touring-map

## Import / Export database

Export from prod database (throw SSH tunel):

    mongodump --host localhost:27018 -d biketouringmap -o ./dumps
    
Import to dev database:

    mongorestore --db biketouringmap-dev ./dumps/biketouringmap/
    
    or 
    
    mongorestore --host localhost:27018 --db globalbikerweb-beta ./dumps/biketouringmap/
    
