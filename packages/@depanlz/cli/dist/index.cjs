'use strict';

var path = require('path');
var core = require('@depche/core');
var fs = require('fs');

var version = "0.0.1-alpha.0";

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
function red(str) {
    return RED + str + RESET;
}
function green(str) {
    return GREEN + str + RESET;
}

class UnkonwnCommandError extends Error {
    constructor(message) {
        super(red(message));
        this.name = "UnkonwnCommandError";
    }
}

function log(message) {
    console.log(message);
}
function success(message) {
    console.log(green(message));
}

function globalConsole(version) {
    success('\n==================================');
    success(`🔍depanlz version ${version}`);
    success('==================================\n');
    log('Usage: depanlz <command> [options]\n');
    log("Global Options:");
    log('   -V, --version                          Show the version number');
    log('   -h, --help                             Display help for command\n');
    log('Commands:');
    log('   analyze [options]                      Analyze dependencies for your project');
}

function analyzeConsole() {
    success('\n==================================');
    success(`🔍depanlz analyze`);
    success('==================================\n');
    log('Usage: depanlz analyze [options]\n');
    log("Options:");
    log('   -j, --json                             Show the version number');
    log('   -h, --help                             Display help for command');
    log('   -w, --web                              Start a web server for check dependencies\n');
}

function findNodeById(nodes, id) {
    return nodes.find(node => node.id === id);
}
function buildDependencyTree(node, nodes, edges) {
    const relations = edges.filter(edge => edge.source === node.id);
    const dependencies = relations.map(relation => buildDependencyTree(findNodeById(nodes, relation.target), nodes, edges));
    return {
        name: node.dependence,
        version: node.version,
        depth: node.level,
        dependencies: dependencies.length === 0 ? null : dependencies
    };
}
function stringifyGraph(depGraph) {
    const { nodes, edges } = depGraph;
    const rootNode = nodes[0];
    return JSON.stringify(buildDependencyTree(rootNode, nodes, edges));
}
function ObjifyGraph(depGraph) {
    const { nodes, edges } = depGraph;
    const rootNode = nodes[0];
    return buildDependencyTree(rootNode, nodes, edges);
}

function analyze(argument) {
    /**
     * depanlz analyze -h
     * depanlz analyze --help
     */
    const help = argument[0];
    if (help === "-h" || help === "--help") {
        analyzeConsole();
        return;
    }
    /**
     * depanlz analyze -d
     * depanlz analyze --depth
     */
    let depth = 3;
    const dIndex = argument.indexOf("-d");
    const depthIndex = argument.indexOf("--depth");
    if (dIndex !== -1) {
        const depthNumber = parseInt(argument[dIndex + 1]);
        depth = isNaN(depthNumber) ? depth : depthNumber;
    }
    else if (depthIndex !== -1) {
        const depthNumber = parseInt(argument[depthIndex + 1]);
        depth = isNaN(depthNumber) ? depth : depthNumber;
    }
    /**
     * depanlz analyze -j
     * depanlz analyze --json
     */
    const cwd = process.cwd();
    let filePath = path.join(cwd, "depGraph.json");
    const jsonFlag = argument.includes("--json") || argument.includes("-j");
    const jIndex = argument.indexOf("-j");
    const jsonIndex = argument.indexOf("--json");
    if (jIndex !== -1) {
        let fileName = argument[jIndex + 1];
        if (fileName === undefined) {
            fileName = String("-" + fileName);
        }
        filePath = fileName.startsWith("-") ? filePath : path.join(cwd, fileName);
    }
    else if (jsonIndex !== -1) {
        let fileName = argument[jsonIndex + 1];
        if (fileName === undefined) {
            fileName = String("-" + fileName);
        }
        filePath = fileName.startsWith("-") ? filePath : path.join(cwd, fileName);
    }
    /**
     * depanlz analyze -w
     * depanlz analyze --web
     */
    let PORT = 3000;
    const webFlag = argument.includes("-w") || argument.includes("--web");
    const wIndex = argument.indexOf("-w");
    const webthIndex = argument.indexOf("--web");
    if (wIndex !== -1) {
        const port = parseInt(argument[wIndex + 1]);
        PORT = isNaN(port) ? PORT : port;
    }
    else if (webthIndex !== -1) {
        const port = parseInt(argument[webthIndex + 1]);
        PORT = isNaN(port) ? PORT : port;
    }
    const depanlz = new core.DepAnlz(depth);
    const depGraph = depanlz.lifeCycle();
    if (jsonFlag && !webFlag) {
        const json = stringifyGraph(depGraph);
        fs.writeFileSync(filePath, json);
        success(`Dependency analysis file are created in
        ${filePath}`);
    }
    else if (webFlag && !jsonFlag) {
        import('@depche/web-server').then(module => {
            const { webServer } = module;
            webServer.prototype.PORT = PORT;
            depanlz.postHook(webServer);
        });
    }
    else if (jsonFlag && webFlag) {
        const json = stringifyGraph(depGraph);
        fs.writeFileSync(filePath, json);
        success(`Dependency analysis file are created in
        ${filePath}\n`);
        import('@depche/web-server').then(module => {
            const { webServer } = module;
            webServer.prototype.PORT = PORT;
            depanlz.postHook(webServer);
        });
    }
    else {
        const obj = ObjifyGraph(depGraph);
        console.log(obj);
    }
}

const args = process.argv.slice(2);
const input = args[0];
const argument = process.argv.slice(3);
const globalOptions = ["-V", "--version", "-h", "--help"];
const commands = [undefined, "analyze"];
const flag = globalOptions.includes(input) || commands.includes(input);
try {
    if (!flag)
        throw new UnkonwnCommandError("(!) You have passed an unrecognized command");
}
catch (e) {
    console.log(e);
}
if (input === "-h" || input === "--help" || input === undefined)
    globalConsole(version);
if (input === "-V" || input === "--version")
    console.log(`🔍depanlz v${version}`);
if (input === "analyze") {
    analyze(argument);
}
//# sourceMappingURL=index.cjs.map
