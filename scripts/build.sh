#!/bin/sh

SCRIPTDIR=$(dirname "$0")
BASEDIR=$(dirname "$SCRIPTDIR")
DISTDIR="$BASEDIR/dist"

DOWHAT=""
if [ -z "$1" ] || [ "$1" = "all" ]; then
  DOWHAT="all"
elif [ "$1" = "chrome" ]; then
  DOWHAT="chrome"
elif [ "$1" = "firefox" ]; then
  DOWHAT="firefox"
elif [ "$1" = "safari" ]; then
  DOWHAT="safari"
fi
if [ -z "$DOWHAT" ]; then
  echo "unknown browser: $1"
  exit 1
fi

if [ ! -d "$DISTDIR" ]; then
    mkdir "$DISTDIR"
fi

do_build() {
    BROWSER="$1"
    if [ ! -f "$BASEDIR/src/manifest/manifest.$BROWSER.json" ]; then
        if [ "$DOWHAT" = "$BROWSER" ]; then
            echo "Manifest not found for $BROWSER"
            exit 1
        fi
        return
    fi
    if [ ! -d "$DISTDIR/$BROWSER" ]; then
        mkdir "$DISTDIR/$BROWSER"
    fi
    cp -p "$BASEDIR/src/popup.css" "$BASEDIR/src/popup.html" "$BASEDIR/src/popup.js" "$DISTDIR/$BROWSER/"
    rsync -a "$BASEDIR/src/icons/" "$DISTDIR/$BROWSER/icons/"
    rsync -a "$BASEDIR/src/_locales/" "$DISTDIR/$BROWSER/_locales/"
    cp -p "$BASEDIR/src/manifest/manifest.$BROWSER.json" "$DISTDIR/$BROWSER/manifest.json"
}

if [ "$DOWHAT" = "all" ] || [ "$DOWHAT" = "chrome" ]; then
    do_build "chrome"
fi
if [ "$DOWHAT" = "all" ] || [ "$DOWHAT" = "firefox" ]; then
    do_build "firefox"
fi
if [ "$DOWHAT" = "all" ] || [ "$DOWHAT" = "safari" ]; then
    do_build "safari"
fi
