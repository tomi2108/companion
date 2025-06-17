#!/usr/bin/env bash

git pull
npm uninstall -g companion
npm install
npm run build
npm run test
# TODO: this will probably only work in linux...
cp  -r ./src/scripts ./dist/scripts
npm install -g .
