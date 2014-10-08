#!/bin/bash

cd /app/dist

export NODE_ENV=production
npm start

#forever start -c "npm start" /app/dist