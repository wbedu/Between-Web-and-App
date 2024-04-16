const unminify = require('unminify');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

if (process.argv.length === 2) {
    console.error('Usage: node transpile.js input_file.js');
    process.exit(1);
}

const inputFileName = process.argv[2];
const outputFileName = inputFileName.replace(/\.js$/, '.unminified.js');

const input = fs.readFileSync(inputFileName);

let result = null;
try {
    result = babel.transformSync(input, {
        presets: ['@babel/preset-env'],
        targets: {
            "electron": "19.1.8",
            // esmodules: true,
        },
        compact: false
    });
    console.log("Code transformed.");

    // const ast = parser.parse(result.code.toString(), {
    //     sourceType: "module",
    //     plugins: []
    // });

    // fs.writeFileSync('ast.json', JSON.stringify(ast));
}
catch(error) {
    console.error("Error in transpiling code: ", error);
}

// if (result !== null) {
//     const unminified  = unminify.unminifySource(result.code.toString(), {
//         safety: unminify.safetyLevels.UNSAFE,
//     });
//     console.log("Code unminified.");

//     fs.writeFileSync(outputFileName, unminified);
// }
fs.writeFileSync(outputFileName, result.code.toString())