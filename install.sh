#!/usr/bin/env bash

# git pull
npm uninstall -g maro
npm run clean
npm install
npm run build
npm run test -- --silent
npm install -g .
