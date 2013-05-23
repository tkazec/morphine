#!/bin/bash
# $ bash build.sh outdir ga-id ratchet-id

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR=$1
GAID=$2
RBID=$3

rm -rf $OUTDIR
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

rm build.sh
rm -rf .git

sed -i '' -e "s/##GAID##/$GAID/" scripts/background.js
sed -i '' -e "s/##RBID##/$RBID/" scripts/errors.js

find . -path '*/.*' -prune -o -type f -print | zip morphine.zip -@