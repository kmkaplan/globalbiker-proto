bike-touring-map
================

Map application to share bike tours itinaries.

## Production deployment

### Docker build

Build the docker image from sources:  
    
    docker build -t="bike-touring-map" .
    
### Pre-requisites

Run a mongoDB image with shared directory:

    mkdir -p /opt/docker/mongodb/data

    sudo docker run -d \
        -p 27017:27017 \
        -v /opt/docker/mongodb/data:/data/db \
        --name mongodb dockerfile/mongodb
   
### Test the image

    docker run --rm -i --link=mongodb:mongodb -t bike-touring-map /bin/bash
   
### Run application

    APP=$(docker run -d --link=mongodb:mongodb -p 8080:9209 --name globalbiker.org  bike-touring-map)
    PORT=$(docker port $APP 9209 | awk -F: '{print $2}')
    echo "Open http://localhost:$PORT/"
