#!/bin/bash

set -e

set -x

rm -rf /app/*

cp /deploy /app

cd /app

# npm build
npm install

# bower build
bower install --allow-root --config.interactive=false

# Define working directory.
grunt build --force
