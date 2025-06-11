#!/usr/bin/env bash

git pull
npm uninstall -g .
npm install
npm run build
# TODO: this will probably only work in linux...
cp  -r ./src/scripts ./dist/scripts
npm install -g .
