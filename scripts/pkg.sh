#!/bin/sh

SCRIPTDIR=$(dirname "$0")
BASEDIR=$(dirname "$SCRIPTDIR")
DISTDIR="$BASEDIR/dist"
EXTDIR="$BASEDIR/extensions"

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

# build things
$BASEDIR/scripts/build.sh $DOWHAT


if [ ! -z "$2" ]; then
    VERSION="$2"
else
    # this is not the best way to do this
    VERSION=$(grep '"version"' "$BASEDIR/src/manifest/manifest.chrome.json" | awk -F '"' '{ print $4; }')
fi

if [ ! -d "$EXTDIR" ]; then
    mkdir "$EXTDIR"
fi

do_pkg() {
    BROWSER="$1"
    if [ ! -f "$BASEDIR/src/manifest/manifest.$BROWSER.json" ]; then
        # silently ignore
        return
    fi
    if [ ! -d "$BASEDIR/dist/$BROWSER" ]; then
        echo "Directory for $BROWSER not found"
        return
    fi
    WORKDIR="$(pwd)"
    cd "$BASEDIR/dist/$BROWSER"
    # ../../ is because we are in ./dist/$BROWSER
    zip -r --quiet "../../$EXTDIR/safe-tab-url-lister-$BROWSER-$VERSION.zip" ./
    cd "$WORKDIR"
}

if [ "$DOWHAT" = "all" ] || [ "$DOWHAT" = "chrome" ]; then
    do_pkg "chrome"
fi
if [ "$DOWHAT" = "all" ] || [ "$DOWHAT" = "firefox" ]; then
    do_pkg "firefox"
fi
