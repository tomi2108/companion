#!/usr/bin/env bash

git pull
npm uninstall -g .
npm install
npm run build
npm install -g .

