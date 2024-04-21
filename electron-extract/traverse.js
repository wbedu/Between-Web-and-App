const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');

if (process.argv.length === 2) {
    console.error('Usage: node traverse.js input_file.js');
    process.exit(1);
}

const code = fs.readFileSync(process.argv[2]);

const ast = parser.parse(code.toString(), {
  sourceType: 'module',
  plugins: [
    'asyncGenerators',
    'dynamicImport'
  ]
});

const getObjectPath = (node) => {
    if (node.type === 'Identifier') {
        return node.name;
    } else if (node.type === 'MemberExpression') {
        return `${getObjectPath(node.object)}.${node.property.name}`;
    } else {
        return '';
    }
}

const doCallTraversal = (symbol) => {
    let identifiers = new Map();
    let functionStack = [];
    
    traverse(ast, {
        FunctionDeclaration(path) {
            functionStack.push({node: path.node, name: path.node.id.name});
        },
        FunctionExpression(path) {
            let name = "anonymous function";
            if (path.parent.type === 'VariableDeclarator' && path.parent.id.type === 'Identifier') {
                name = path.parent.id.name;
            } else if (path.node.id && path.node.id.name) {
                name = path.node.id.name;
            }
            functionStack.push({node: path.node, name: name});
        },
        ArrowFunctionExpression(path) {
            let name = "anonymous function";
            if (path.parent.type === 'VariableDeclarator' && path.parent.id.type === 'Identifier') {
                name = path.parent.id.name;
            }
            functionStack.push({node: path.node, name: name});
        },
        VariableDeclarator(path) {
            if (path.node.id.type === 'Identifier') {
                identifiers.set(path.node.id.name, path.node);
            }
        },
        exit(path) {
            if (path.isFunctionDeclaration() || path.isFunctionExpression() || path.isArrowFunctionExpression()) {
                functionStack.pop();
            }
        },
        AssignmentExpression(path) {
            if (path.node.left.type === 'Identifier') {
                identifiers.set(path.node.left.name, path.node.right);
            }
        },
        CallExpression(path) {
            if (path.node.callee.type === 'MemberExpression' && path.node.callee.property?.name === symbol) {
                const objectNode = path.node.callee.object;
                const objectPath = getObjectPath(objectNode);
                const currentFunction = functionStack[functionStack.length - 1] || {name: 'global scope'};
                const functionName = currentFunction.name;
                console.log(`${symbol},${objectPath},${path.node.loc.start.line},${process.argv[2]},${functionName}`);
            }
        }
    });
}

const targets = [
    /* require("os") */
    "arch",
    "cpus",
    "totalmem",
    "getPrimaryDisplay",
    "getAllDisplays",
    "machine",
    "hostname",
    "freemem",
    "platform",
    "totalmem",
    "version",
    "release",
    "userInfo",
    "type",
    /* const {app} = require("electron") */
    "getGPUFeatureStatus",
    "getGPUInfo",
    "getLocale",
    "getLocaleCountryCode",
    "getSystemLocale"

]
targets.forEach(target => {
    doCallTraversal(target);
})