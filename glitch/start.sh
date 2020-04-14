#! /bin/bash

readonly SITE=dobbs-seran-turtles.glitch.me

cd /app/seran-wiki
./seran-wiki.sh --domain=$SITE ../meta-sites/$SITE &

pid=$!

wait ${pid}
