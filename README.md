bike-touring-map
================

Map application to share bike tours itinaries.

## Import / Export database

Export from prod database:

    mongodump -d biketouringmap -o ./dumps
    
Import to dev database:

    mongorestore --db biketouringmap-dev ./dumps

## Continuous integration deployment

### Docker build

Build the docker image from sources:  
    
    cd docker/ci
    docker build -t="bike-touring-map-ci" .
    
### Pre-requisites

Run a mongoDB image with shared directory:

    mkdir -p /opt/docker/mongodb/data

    sudo docker run -d \
        -p 27017:27017 \
        -v /opt/docker/mongodb/data:/data/db \
        --name mongodb dockerfile/mongodb
   
### Test the image

    docker run --rm -i \
        --link=mongodb:mongodb \
        -p 8080:8080 \
        -v /opt/docker/jenkins/share/globalbiker.org/deploy/:/deploy \
        -v /opt/docker/jenkins/share/globalbiker.org/app/:/app \
        -t bike-touring-map-ci /bin/bash
   
### Run application

    docker run -d \
        --link=mongodb:mongodb \
        -p 80:8080 \
        -v /bike-touring-map:/deploy \
        --name globalbiker.org  bike-touring-map-ci

or

    docker run -d \
        --link=mongodb:mongodb \
        -p 9209:8080 \
        -v /opt/docker/jenkins/share/globalbiker.org/deploy/:/deploy \
        -v /opt/docker/jenkins/share/globalbiker.org/app/:/app \
        --name globalbiker.org bike-touring-map-ci
