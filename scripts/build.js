#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SCRIPTDIR = __dirname;
const BASEDIR = path.dirname(SCRIPTDIR);
const DISTDIR = path.join(BASEDIR, "dist");

const browser = process.argv[2] || "all";
const VALID = ["all", "chrome", "firefox", "safari"];

if (!VALID.includes(browser)) {
    console.error(`Unknown browser: ${browser}`);
    process.exit(1);
}

fs.mkdirSync(DISTDIR, { recursive: true });

function copyRecursive(src, dst) {
    if (!fs.existsSync(src)) return;

    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        fs.mkdirSync(dst, { recursive: true });

        for (const file of fs.readdirSync(src)) {
            copyRecursive(
                path.join(src, file),
                path.join(dst, file)
            );
        }
    } else {
        fs.copyFileSync(src, dst);
    }
}

function doBuild(browser) {

    const manifest =
        path.join(
            BASEDIR,
            "src",
            "manifest",
            `manifest.${browser}.json`
        );

    if (!fs.existsSync(manifest)) {

        if (process.argv[2] === browser) {
            console.error(`Manifest not found for ${browser}`);
            process.exit(1);
        }

        return;
    }

    const outDir = path.join(DISTDIR, browser);

    fs.mkdirSync(outDir, { recursive: true });

    [
        "popup.css",
        "popup.html",
        "popup.js"
    ].forEach(file => {

        fs.copyFileSync(
            path.join(BASEDIR, "src", file),
            path.join(outDir, file)
        );

    });

    copyRecursive(
        path.join(BASEDIR, "src", "icons"),
        path.join(outDir, "icons")
    );

    copyRecursive(
        path.join(BASEDIR, "src", "_locales"),
        path.join(outDir, "_locales")
    );

    fs.copyFileSync(
        manifest,
        path.join(outDir, "manifest.json")
    );

    console.log(`Built ${browser}`);
}

if (browser === "all" || browser === "chrome")
    doBuild("chrome");

if (browser === "all" || browser === "firefox")
    doBuild("firefox");

if (browser === "all" || browser === "safari")
    doBuild("safari");
