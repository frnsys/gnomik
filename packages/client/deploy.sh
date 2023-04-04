#!/bin/bash

ENV=$1

npm run build

TARGET=ftseng@starbase:/srv/share/gnomik
cp -r assets/img dist/assets/img
cp -r assets/fonts dist/assets/fonts
cp assets/gnome.png dist/assets/gnome.png
sed -i 's|/assets|assets|' dist/index.html
rsync -ravu dist/ --copy-links --delete --exclude=*.md --exclude=.git --exclude=node_modules $TARGET