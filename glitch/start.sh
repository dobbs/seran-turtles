#! /bin/bash

readonly SITE=$GLITCH_DOMAIN.glitch.me

cd /app/seran-wiki
./seran-wiki.sh --domain=$SITE ../meta-sites/$SITE &

pid=$!

wait ${pid}
