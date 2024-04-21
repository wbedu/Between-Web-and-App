# electron-extract

A set of scripts and pipelines to decompile/deobfuscate packaged Electron applications for static analysis.

## Usage
### pipeline.sh
```
./pipeline.sh [application path]
```
This runs the full pipeline to extract all .js files from a packaged Electron asar. This pipeline additionally runs transpile.js and traverse.js to unminify source files and generate a report utilizing Babel ASTs (Abstract Syntax Tree). A report (.csv) will be generated in the directory the pipeline was executed in.

### pipeline-unpackaged.sh
```
./pipeline-unpackaged.sh [application path]
```
This runs similarly to pipeline.sh for applications that do not utilize .asar packaging (ex. WordPress.com, GitHub Desktop).


### get-electron-version.js
```
node get-electron-version.js [application path]
```

This script will print out the version of Electron utilized to be specified during transpilation. This script can be also utilized to determine if an application is an typical Electron application (if it does not print any version). 

This script spawns the Electron app with debugging ports open and attaches a Puppeteer instance. From here, Puppeteer gets the `navigator.userAgent` to fetch the Electron version.

### asar-extract.js
```
node asar-extract.js [application path]
```
This script will extract all .js files under all Electron asars present within an application bundle to `out/applicationName_Extract`. This script also prints out all contents found within the asar package.

### transpile.js
```
node transpile.js [input.js]
```
This script utilizes Babel to transpile a minified source JavaScript to a more readable format. Note, Electron version must be specified under Babel targets.

### traverse.js
```
node traverse.js [input.js]
```
This script utilizes Babel to create an AST and traverses it to find usages of target functions, their calling object, containing function, and line number. Results will be printed to stdout.

While transpile.js can do a pretty good job at making the code readable, many imports can still be obfuscated. This script aids an annotator by capturing the scope of a function call, as we found that obfuscated symbol names share the same name throughout one fle. Additionally, we found that many instances of telemetry/tracking code is grouped close together in source code (many cases in the same function), which this script can easily highlight to an annotator.