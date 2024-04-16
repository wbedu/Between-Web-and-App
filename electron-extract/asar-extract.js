const asar = require('@electron/asar');
const fs = require('fs');
const path = require('path');

if (process.argv.length === 2) {
    console.error('Usage: node asar-extract.js application.app');
    process.exit(1);
}

const getAsars = (application_path) => {
    let result = {};

    try {
        const entries = fs.readdirSync(application_path, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(application_path, entry.name);
            if (entry.isDirectory()) {
                const subResults = getAsars(fullPath);
                result = { ...result, ...subResults };
            } else if (path.extname(entry.name) === '.asar') {
                result[entry.name] = fullPath;
            }
        }
    }
    catch (error) {
        console.error("Error in getting asars: ", error);
    }
    
    return result;
}

const listAsarContents = (asarPath) => {
    try {
        return asar.listPackage(asarPath);
    }
    catch (error) {
        console.error("Error in listing asar contents: ", error);
        return [];
    }
}

const extractFileFromAsar = (asar_path, relative_path) => {
    return asar.extractFile(asar_path, relative_path).toString();
}

const filterJSOnly = (contents) => {
    return contents.filter(file => file.endsWith('.js'));
}

const application_path = process.argv[2];

const asars = getAsars(application_path);
Promise.all(Object.keys(asars).map(async asarKey => {
    try {
        const contents = await listAsarContents(asars[asarKey]);
        asars[asarKey] = {
            'path': asars[asarKey],
            'contents': filterJSOnly(contents) // Filter down to only JS files.
        }
    } catch (error) {
        console.error("Error in processing asar: ", error);
    }
})).then(() => {
    console.log(asars);

    const app_name =  path.basename(application_path);
    const app_name_no_extension = path.parse(app_name).name;

    const outDir = path.join(__dirname, 'out', app_name_no_extension + '_extract');

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
        console.log('Created directory: ', outDir);
    } else {
        console.log('Directory already exists, skipping creation:', outDir);
    }

    Promise.all(Object.keys(asars).map(async asarKey => {
        try {
            asars[asarKey]['contents'].forEach(jsFile => {
                const jsFileRelative = jsFile.startsWith("/") ? jsFile.substring(1) : jsFile; // Strip starting "/" if exists.
                const content = extractFileFromAsar(asars[asarKey]["path"], jsFileRelative);
                const asarKeyWithoutExtension = path.parse(asarKey).name;
                const outSubdir = path.join(outDir, asarKeyWithoutExtension);
                if(!fs.existsSync(outSubdir)) {
                    fs.mkdirSync(outSubdir);
                }
                fs.writeFileSync(path.join(outSubdir, path.basename(jsFile)), content);
            });
        } catch (error) {
            console.error("Error in processing asar: ", error);
        }
    })).then(() => {
        console.log("asars extracted");
    });
});


// const test = extractFileFromAsar('/Users/chrisgrams/Notes/CS 568/apps/Slack.app/Contents/Resources/app-arm64.asar', "dist/main.bundle.js");

// fs.writeFileSync("slack-main.js", test);