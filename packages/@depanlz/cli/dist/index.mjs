import { join } from 'path';
import { DepAnlz } from '@depche/core';
import { writeFileSync } from 'fs';

var version = "0.0.2";

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var RESET = "\x1b[0m";
var RED = "\x1b[31m";
var GREEN = "\x1b[32m";
function red(str) {
    return RED + str + RESET;
}
function green(str) {
    return GREEN + str + RESET;
}

var UnkonwnCommandError = /** @class */ (function (_super) {
    __extends(UnkonwnCommandError, _super);
    function UnkonwnCommandError(message) {
        var _this = _super.call(this, red(message)) || this;
        _this.name = "UnkonwnCommandError";
        return _this;
    }
    return UnkonwnCommandError;
}(Error));

function log(message) {
    console.log(message);
}
function success(message) {
    console.log(green(message));
}

function globalConsole(version) {
    success('\n==================================');
    success("\uD83D\uDD0Ddepanlz version ".concat(version));
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
    success("\uD83D\uDD0Ddepanlz analyze");
    success('==================================\n');
    log('Usage: depanlz analyze [options]\n');
    log("Options:");
    log('   -j, --json                             Show the version number');
    log('   -h, --help                             Display help for command');
    log('   -w, --web                              Start a web server for check dependencies\n');
}

function findNodeById(nodes, id) {
    return nodes.find(function (node) { return node.id === id; });
}
function buildDependencyTree(node, nodes, edges) {
    var relations = edges.filter(function (edge) { return edge.source === node.id; });
    var dependencies = relations.map(function (relation) { return buildDependencyTree(findNodeById(nodes, relation.target), nodes, edges); });
    return {
        name: node.dependence,
        version: node.version,
        depth: node.level,
        dependencies: dependencies.length === 0 ? null : dependencies
    };
}
function stringifyGraph(depGraph) {
    var nodes = depGraph.nodes, edges = depGraph.edges;
    var rootNode = nodes[0];
    return JSON.stringify(buildDependencyTree(rootNode, nodes, edges));
}
function ObjifyGraph(depGraph) {
    var nodes = depGraph.nodes, edges = depGraph.edges;
    var rootNode = nodes[0];
    return buildDependencyTree(rootNode, nodes, edges);
}

function analyze(argument) {
    /**
     * depanlz analyze -h
     * depanlz analyze --help
     */
    var help = argument[0];
    if (help === "-h" || help === "--help") {
        return analyzeConsole();
    }
    /**
     * depanlz analyze -d
     * depanlz analyze --depth
     */
    var depth = 3;
    var dIndex = argument.indexOf("-d");
    var depthIndex = argument.indexOf("--depth");
    if (dIndex !== -1) {
        var depthNumber = parseInt(argument[dIndex + 1]);
        depth = isNaN(depthNumber) ? depth : depthNumber;
    }
    else if (depthIndex !== -1) {
        var depthNumber = parseInt(argument[depthIndex + 1]);
        depth = isNaN(depthNumber) ? depth : depthNumber;
    }
    /**
     * depanlz analyze -j
     * depanlz analyze --json
     */
    var cwd = process.cwd();
    var filePath = join(cwd, "depGraph.json");
    var jsonFlag = argument.includes("--json") || argument.includes("-j");
    var jIndex = argument.indexOf("-j");
    var jsonIndex = argument.indexOf("--json");
    if (jIndex !== -1) {
        var fileName = argument[jIndex + 1];
        if (fileName === undefined) {
            fileName = String("-" + fileName);
        }
        filePath = fileName.startsWith("-") ? filePath : join(cwd, fileName);
    }
    else if (jsonIndex !== -1) {
        var fileName = argument[jsonIndex + 1];
        if (fileName === undefined) {
            fileName = String("-" + fileName);
        }
        filePath = fileName.startsWith("-") ? filePath : join(cwd, fileName);
    }
    /**
     * depanlz analyze -w
     * depanlz analyze --web
     */
    var PORT = 3000;
    var webFlag = argument.includes("-w") || argument.includes("--web");
    var wIndex = argument.indexOf("-w");
    var webthIndex = argument.indexOf("--web");
    if (wIndex !== -1) {
        var port = parseInt(argument[wIndex + 1]);
        PORT = isNaN(port) ? PORT : port;
    }
    else if (webthIndex !== -1) {
        var port = parseInt(argument[webthIndex + 1]);
        PORT = isNaN(port) ? PORT : port;
    }
    var depanlz = new DepAnlz(depth);
    var depGraph = depanlz.lifeCycle();
    if (jsonFlag && !webFlag) {
        var json = stringifyGraph(depGraph);
        writeFileSync(filePath, json);
        success("Dependency analysis file are created in\n        ".concat(filePath));
    }
    else if (webFlag && !jsonFlag) {
        import('@depche/web-server').then(function (module) {
            var webServer = module.webServer;
            webServer.prototype.PORT = PORT;
            depanlz.postHook(webServer);
        });
    }
    else if (jsonFlag && webFlag) {
        var json = stringifyGraph(depGraph);
        writeFileSync(filePath, json);
        success("Dependency analysis file are created in\n        ".concat(filePath, "\n"));
        import('@depche/web-server').then(function (module) {
            var webServer = module.webServer;
            webServer.prototype.PORT = PORT;
            depanlz.postHook(webServer);
        });
    }
    else {
        var obj = ObjifyGraph(depGraph);
        console.log(obj);
    }
}

var args = process.argv.slice(2);
var input = args[0];
var argument = process.argv.slice(3);
var globalOptions = ["-V", "--version", "-h", "--help"];
var commands = [undefined, "analyze"];
var flag = globalOptions.includes(input) || commands.includes(input);
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
    console.log("\uD83D\uDD0Ddepanlz v".concat(version));
if (input === "analyze") {
    analyze(argument);
}
//# sourceMappingURL=index.mjs.map
