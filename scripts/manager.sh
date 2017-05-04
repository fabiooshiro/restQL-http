#!/usr/bin/env bash

export DIST_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."

export RUN_API=false
export RUN_MANAGER=true

$DIST_PATH/bin/prepare.sh
