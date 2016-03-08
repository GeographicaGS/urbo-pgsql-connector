#!/bin/bash
node-inspector --web-port 8080 &
npm run-script debug
