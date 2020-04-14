#! /bin/bash

if ! command -v deno &>/dev/null; then
  # deno install.sh installs the deno binary at $DENO_INSTALL/bin
  # glitch includes /app/bin in $PATH
  export DENO_INSTALL=/app
  curl -fsSL https://deno.land/x/install/install.sh | sh -s v0.40.0
else
  deno --version
fi

if [ ! -d /app/seran-wiki  ]; then
  cd /app
  git clone https://github.com/joshuabenuck/seran-wiki
fi

readonly SITE=dobbs-seran-turtles.glitch.me
if [ ! -h /app/meta-sites/${SITE}.ts ]; then
  cd /app/meta-sites
  ln -s wander.ts $SITE.ts
fi
