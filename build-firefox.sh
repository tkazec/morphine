#!/bin/bash

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR=../morphine-build

echo "src: $SRCDIR"
echo "out: $OUTDIR"

rm -rf $OUTDIR
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

rm build*.sh
rm -rf .git

find . -path '*/.*' -prune -o -type f -print | zip morphine.zip -@
