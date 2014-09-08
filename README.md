bike-touring-map
================

Map application to share bike tours itinaries.

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
        -v /home/toub/dev/globalbiker/bike-touring-map:/app \
        -t bike-touring-map-ci /bin/bash
   
### Run application

    docker run -d \
        --link=mongodb:mongodb \
        -p 80:8080 \
        -v /home/toub/dev/globalbiker/bike-touring-map:/app \
        --name globalbiker.org  bike-touring-map-ci

or

    docker run -d \
        --link=mongodb:mongodb \
        -p 9209:8080 \
        -v /opt/docker/jenkins/share/toulouse.globalbiker.org/deploy/:/app \
        --name toulouse.globalbiker.org bike-touring-map-ci
