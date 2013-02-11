#!/bin/bash
# $ bash build.sh outdir ga-id ratchet-id

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR=$1
GAID=$2
RATCHETID=$3

rm -rf $OUTDIR
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

rm build.sh
rm -rf .git

sed -i '' -e "s/##GA##/$GAID/" scripts/background.js
sed -i '' -e "s/##RATCHET##/$RATCHETID/" scripts/errors.js

find . -path '*/.*' -prune -o -type f -print | zip morphine.zip -@