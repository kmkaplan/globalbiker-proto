#!/bin/bash

set -e

set -x

rm -rf /app/dist

cd /app

# npm build
npm install

# bower build
bower install --allow-root --config.interactive=false

# grunt build
grunt build:dist --force
