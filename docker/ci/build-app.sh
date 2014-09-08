#!/bin/bash

set -e

set -x

cd /app

# npm build
npm install

# bower build
bower install --allow-root --config.interactive=false

# Define working directory.
grunt build --force
