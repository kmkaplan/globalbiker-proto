bike-touring-map
================

Map application to share bike tours itinaries.

## Warning: work in progress

The project just started a few days ago, is unstable and has a lack of documentation. Use it at your own risks.

## Dev install

FIXME: work in progress

### Pre-requisites

#### Libvips Image processing library

Install [Libvips](https://github.com/jcupitt/libvips).

##### Debian/Ubuntu installer

    sudo apt-get install libvips-dev

##### Windows installer

[Windows installer](http://www.vips.ecs.soton.ac.uk/supported/current/win32/)

##### Max OSX installer

[Max OSX installer](http://www.vips.ecs.soton.ac.uk/supported/current/osx/)
        
## Import / Export database

Export from prod database:

    mongodump -d biketouringmap -o ./dumps
    
Import to dev database:

    mongorestore --db biketouringmap-dev ./dumps

## Continuous integration deployment

### Docker build

Build the docker image from sources:  
    
    sudo docker build -t="globalbiker/bike-touring-map" .

    
### Pre-requisites

Run a mongoDB image with shared directory:

    mkdir -p /opt/docker/mongodb/data

    sudo docker run -d \
        -p 27019:27017 \
        -v /opt/docker/mongodb/data:/data/db \
        --name mongodb dockerfile/mongodb
   
### Test the image

    sudo docker run --rm -i \
        --link=mongodb:mongodb \
        -p 8080:8080 \
        -t globalbiker/bike-touring-map /bin/bash
   
### Run application

Create shared directories to avoid loosing your data:

    mkdir -p /opt/docker/jenkins/share/globalbiker.org/upload
    mkdir -p /opt/docker/jenkins/share/globalbiker.org/photos

Start a new container

    docker run -d \
        --link=mongodb:mongodb \
        --volume=/opt/docker/jenkins/share/globalbiker.org/upload:/app/server/upload \
        --volume=/opt/docker/jenkins/share/globalbiker.org/photos:/app/server/photos \
        -p 9209:8080 \
        --name globalbiker.org -t globalbiker/bike-touring-map
