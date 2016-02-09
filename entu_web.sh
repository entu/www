#!/bin/bash

mkdir -p /data/entu_web/code
cd /data/entu_web/code

git clone https://github.com/argoroots/entu-web.git ./
git checkout master
git pull
