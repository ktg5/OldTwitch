const fs = require('fs-extra');
const path = require('path');
const Zip = require('adm-zip');
const process = require('process');
const readline = require('readline');
const { execSync } = require('child_process');


// Before starting, make sure that the other folders don't exist.
var chromeDir = 'dist/OldTTV-Chrome';
var firefoxDir = 'dist/OldTTV-Firefox';
if (fs.existsSync('./dist')) {
    console.log(`Deleting dist folder`);
    fs.rmSync('./dist', { recursive: true });
    console.log(`Deleted dist folder`);
}


// Function to copy all the dirs but not REALLY all of them.
async function copyDir(sourceDir, newDir) {
    // Get dirs in the project folder.
    var dirs = fs.readdirSync(sourceDir, { withFileTypes: true });
    fs.mkdirSync(newDir);
    
    // now we finna do something with all of these dirs
    for (let entry of dirs) {
        // Folders & files that we AIN'T ALLOWIN'!
        if (
            entry.name === 'dist' ||
            entry.name === '.git' ||
            entry.name === '.github' ||
            entry.name === 'psds' ||
            entry.name === 'node_modules' ||
            entry.name === 'build.js' ||
            entry.name === 'package-lock.json' ||
            entry.name === 'package.json'
        ) continue;

        // Paths
        var sourcePath = path.join(sourceDir, entry.name);
        var newPath = path.join(newDir, entry.name);
        switch (entry.name) {
            case "tobethereadme":
                newPath = path.join(newDir, "README");
            break;
        }

        // If the file is a TS file, we'll need to find the JS file within the "ts-dist" folder.
        if (entry.name.endsWith('.ts')) {
            const jsName = entry.name.substring(0, entry.name.length - 3) + '.js';
            const jsPath = path.join(tsDistDir, jsName);
            if (!fs.existsSync(jsPath)) {
                console.error(`No JS file for ${entry.name}`);
                continue;
            }
            sourcePath = jsPath;
            newPath = newPath.replace('.ts', '.js');
        }

        // If the files passed the vibe check, we go.
        if (entry.isDirectory()) {
            await copyDir(sourcePath, newPath);
        } else {
            fs.copyFileSync(sourcePath, newPath);
        }
    }
}


var delFolders = false;
var delZips = false;
// Check for args
process.argv.forEach(function (val, index, array) {
    if (index === 2 && val === "folders") {
        delZips = true;
    } else if (index === 2 && val === "zips") {
        delFolders = true;
    }
});


console.log(`-------------`);
// Here's we build.
// Make sure to have the dist folder ready.
if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');
// Let's copy the src folder for Chrome.
copyDir('./src', chromeDir).then(async () => {
    console.log(`(Re)made the Chrome folder`);

    if (!delZips) {
        // If the zip already exists...
        if (fs.existsSync(`${chromeDir}.zip`)) {
            console.log("Deleting old Chrome zip");
            fs.unlinkSync(`${chromeDir}.zip`);
            console.log("Deleted old Chrome zip");
        }

        console.log("Zipping Chrome version...");
        // Try to zip up the extension
        try {
            const zip = new Zip();
            const outputDir = `${chromeDir}.zip`;
            zip.addLocalFolder(chromeDir);
            zip.writeZip(outputDir);
            if (delFolders) fs.rmSync(chromeDir, { recursive: true });
        } catch (e) {
            console.log(`WHAT THE FRICK! ${e}`);
        }
        console.log(`Zipped Chrome version into ${chromeDir}.zip`);
    }
    console.log(`-------------`);
});

// Then we copy the same folder for Firefox.
copyDir('./src', firefoxDir).then(async () => {
    console.log(`(Re)made the Firefox folder`);
    // Then we modify the Firefox extension a bit cuz no
    // browser developer can come up with extension
    // manifest standards like WHY.
    var firefoxManifest = JSON.parse(fs.readFileSync(`${firefoxDir}/manifest.json`, { encoding: 'utf8' }));
    firefoxManifest.manifest_version = 2;
    firefoxManifest.background = {
        "scripts": [
        "js/ot-background.js"
        ],
        "persistent": false,
        "type": "module"
    };
    let resources = firefoxManifest.web_accessible_resources[0].resources;
    firefoxManifest.web_accessible_resources = resources,
    delete firefoxManifest.action; // Manifest v2 moment
    delete firefoxManifest.background.service_worker; // This is only for Chrome, Firefox will freak out if this isn't deleted lol.
    // Add ID for addin' the extension to the browser lololol
    firefoxManifest.applications = {
        "gecko": {
            "id": "imgaming@home.lol"
        }
    };

    // Write the manifest file for Firefox
    fs.writeFileSync(`${firefoxDir}/manifest.json`, JSON.stringify(firefoxManifest, null, 2));

    // Since v1.6, we also have to replace all the "chrome-extension://" with "moz-extension://"
    // WHY CAN'T IT JUST BE "extension://" OR SOMETHING??????
    console.log('Replacing all css files that include "chrome-extension://" with "moz-extension://"');
    // For each CSS file, do the replacing moment for both vanilla css and v3 css
    async function replaceChromewithMoz(cssFiles) {
        let fsCssFiles = fs.readdirSync(cssFiles);
        fsCssFiles.forEach(cssFileName => {
            let cssPath = `${cssFiles}${cssFileName}`;
            // Make sure cssPath has an extension
            if (cssPath.endsWith('.css')) {
                process.stdout.write(`> ${cssPath}`);
                // Read the CSS file
                let cssFile = fs.readFileSync(cssPath, { encoding: 'utf8' });
                // Replace all chrome-extension:// with moz-extension://
                cssFile = cssFile.replaceAll('chrome-extension://', 'moz-extension://');
                // Then write the CSS file with "cssFile"
                fs.writeFileSync(cssPath, cssFile);
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(`✓ ${cssPath}\n`);
            }
        });
    };
    const htmlDir = `${firefoxDir}/html`;
    const htmlDirList = fs.readdirSync(htmlDir);
    htmlDirList.forEach(async folder => {
        const yearCSSFolder = `${htmlDir}/${folder}/css/`;
        if (folder.startsWith('20') && fs.existsSync(yearCSSFolder)) {
            console.log(`${folder}:`);
            await replaceChromewithMoz(yearCSSFolder);
        }
    });

    console.log(`Replace complete.`);

    // If the zip already exists...
    if (fs.existsSync(`${firefoxDir}.zip`)) {
        console.log("Deleting old Firefox zip");
        fs.unlinkSync(`${firefoxDir}.zip`);
        console.log("Deleted old Firefox zip");
    }

    console.log("Zipping Firefox version...");
    if (!delZips) {
        // Try to zip up the extension
        try {
            const zip = new Zip();
            const outputDir = `${firefoxDir}.zip`;
            zip.addLocalFolder(firefoxDir);
            zip.writeZip(outputDir);
            if (delFolders) fs.rmSync(firefoxDir, { recursive: true });
        } catch (e) {
            console.log(`WHAT THE FRICK! ${e}`);
        }
        console.log(`Zipped Firefox version into ${firefoxDir}.zip`);
    }
    // End
    console.log(`-------------`);
});