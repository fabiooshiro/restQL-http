#!/usr/bin/env bash

export SOURCE_CODE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
export DIST_DIR="$SOURCE_CODE_DIR/dist"
export SCRIPTS_DIR="$SOURCE_CODE_DIR/scripts"
export LEIN_TARGET_DIR="$SOURCE_CODE_DIR/target"

if [[  -e $DIST_DIR ]]; then
    rm -rf $DIST_DIR
fi

mkdir -p "$DIST_DIR/bin"
mkdir -p "$DIST_DIR/plugins"
mkdir -p "$DIST_DIR/java-agents"
mkdir -p "$DIST_DIR/lib"


cd $SOURCE_CODE_DIR && lein uberjar

cp "$LEIN_TARGET_DIR/uberjar/restql-server-standalone.jar" "$DIST_DIR/lib/restql-server.jar"
cp "$SCRIPTS_DIR/run.sh" "$DIST_DIR/bin"
cp "$SCRIPTS_DIR/env.sh" "$DIST_DIR/bin"
cp "$SOURCE_CODE_DIR/LICENSE" "$DIST_DIR"
cp "$SOURCE_CODE_DIR/README.md" "$DIST_DIR"

cd $DIST_DIR
zip -r restql-server.zip .
mv restql-server.zip ..
