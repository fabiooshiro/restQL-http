#!/usr/bin/env bash

export JAVA_AGENTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/java-agents"
export JARS_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/plugins"

if [[ ! -e $JAVA_AGENTS_DIR ]]; then
    mkdir $JAVA_AGENTS_DIR
elif [[ ! -d $JAVA_AGENTS_DIR ]]; then
    echo "$JAVA_AGENTS_DIR already exists but is not a directory" 1>&2
fi

if [[ ! -e $JARS_PATH ]]; then
    mkdir $JARS_PATH
elif [[ ! -d $JARS_PATH ]]; then
    echo "$JARS_PATH already exists but is not a directory" 1>&2
fi

. ./env.sh

export DIST_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/dist"
export JAVA_AGENTS=$(for i in $(ls $JAVA_AGENTS_DIR); do echo "-javaagent:$JAVA_AGENTS_DIR/$i"; done)
export MAIN_JAR="$DIST_PATH/restql-server.jar"

export RUN_CLASSPATH="$MAIN_JAR:$JARS_PATH/*"
export JAVA_CMD="java $JAVA_AGENTS -cp $RUN_CLASSPATH restql.server.core"

echo "Running java with the following line:"
echo $JAVA_CMD

$JAVA_CMD
