#!/bin/sh
mkdir -p dist/proto

# add proto file for packaged action
cp node_modules/zeebe-node/proto/zeebe.proto dist/proto

# https://stackoverflow.com/a/38595160/1758461
darwin=false;
case "`uname`" in
  Darwin*) darwin=true ;;
esac

if $darwin; then
  sedi="/usr/bin/sed -i ''"
else
  sedi="sed -i"
fi

# Change path to proto file for packaged action
$sedi 's/..\/..\/proto/..\/proto/' dist/index.js
