#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { spawnSync } = require("child_process");

const SCRIPTDIR = __dirname;
const BASEDIR = path.dirname(SCRIPTDIR);

const DISTDIR = path.join(BASEDIR, "dist");
const EXTDIR = path.join(BASEDIR, "extensions");

const browser = process.argv[2] || "all";
const VALID = ["all", "chrome", "firefox", "safari"];

if (!VALID.includes(browser)) {
    console.error(`Unknown browser: ${browser}`);
    process.exit(1);
}

//------------------------------------------------------------
// Build first
//------------------------------------------------------------

const build = spawnSync(
    process.execPath,
    [path.join(SCRIPTDIR, "build.js"), browser],
    { stdio: "inherit" }
);

if (build.status !== 0)
    process.exit(build.status);

//------------------------------------------------------------
// Version
//------------------------------------------------------------

let version = process.argv[3];

if (!version) {

    const manifest = JSON.parse(

        fs.readFileSync(
            path.join(
                BASEDIR,
                "src",
                "manifest",
                "manifest.chrome.json"
            ),
            "utf8"
        )

    );

    version = manifest.version;
}

fs.mkdirSync(EXTDIR, { recursive: true });

async function packageBrowser(browser) {

    const src =
        path.join(DISTDIR, browser);

    if (!fs.existsSync(src)) {
        console.log(`${browser}: build directory missing`);
        return;
    }

    const outfile =
        path.join(
            EXTDIR,
            `safe-tab-url-lister--${browser}-${version}.zip`
        );

    const output = fs.createWriteStream(outfile);

    const archive =
        archiver("zip", {
            zlib: { level: 9 }
        });

    return new Promise((resolve, reject) => {

        output.on("close", () => {

            console.log(
                `${path.basename(outfile)} (${archive.pointer()} bytes)`
            );

            resolve();
        });

        archive.on("error", reject);

        archive.pipe(output);

        archive.directory(src, false);

        archive.finalize();

    });

}

(async () => {

    if (browser === "all" || browser === "chrome")
        await packageBrowser("chrome");

    if (browser === "all" || browser === "firefox")
        await packageBrowser("firefox");

    // Safari intentionally not packaged

})();
