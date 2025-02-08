const fs = require('fs-extra');
const path = require('path');
const Zip = require('adm-zip');
const process = require('process');
const readline = require('readline');
const { execSync } = require('child_process');


// Before starting, make sure that the other folders don't exist.
var chromeDir = './dist/OldTTV-Chrome';
var firefoxDir = './dist/OldTTV-Firefox';
var tsDistDir = './ts-dist';
if (fs.existsSync('./dist')) {
    console.log(`Deleting dist folder`);
    fs.rmSync('./dist', { recursive: true });
    console.log(`Deleted dist folder`);
}
if (fs.existsSync(tsDistDir)) {
    console.log(`Deleting dist TypeScript folder`);
    fs.rmSync(tsDistDir, { recursive: true });
    console.log(`Deleted dist TypeScript folder`);
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


var delExtensionFolders = false;
// Check for args
process.argv.forEach(function (val, index, array) {
    if (index === 2 && val === "del-folders") {
        delExtensionFolders = true;
    }
});


console.log(`-------------`);
// Here's we build.
// Let's get "npx tsc" to do it's thing.
console.log(`Compiling TypeScript...`);
execSync('npx tsc');
console.log(`Done building JS files.`);
console.log(`-------------`);

// Okay! we can move on now.
// Make sure to have the dist folder ready.
if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');
// Let's copy the src folder for Chrome.
copyDir('./src', chromeDir).then(async () => {
    console.log(`(Re)made the Chrome folder`);

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
        if (delExtensionFolders) fs.rmSync(chromeDir, { recursive: true });
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`WHAT THE FRICK! ${e}`);
    }
    console.log(`Zipped Chrome version into "${chromeDir}.zip"`);
    console.log(`-------------`);
});