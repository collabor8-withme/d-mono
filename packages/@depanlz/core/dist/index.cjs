'use strict';

var path = require('path');
var fs = require('fs');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);
var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);

function isFileExists(filePath) {
    try {
        fs__namespace.accessSync(filePath, fs__namespace.constants.F_OK);
        return true;
    }
    catch (err) {
        return false;
    }
}

/**
 * preHook 钩子进行预检处理
 * 1. 检查是否从项目根目录启动（是否含有package.json文件）
 * 2. 检查是否已经下载完成依赖（是否含有node_modules目录）
 * 3. 检查使用的包管理器是什么（所含有的lock文件是什么类型）
 *
 * 返回package.json node_modules的绝对目录，以及包管理器名称
 */
var CWD = process.cwd();
var PKG_JSON_DIR = path.join(CWD, "package.json");
var NODE_MODULES_DIR = path.join(CWD, "node_modules");
var NPM_LOCK_DIR = path.join(CWD, "package-lock.json");
var YARN_LOCK_DIR = path.join(CWD, "yarn.lock");
var PNPM_LOCK_DIR = path.join(CWD, "pnpm-lock.yaml");
function detectPackageManager() {
    if (isFileExists(NPM_LOCK_DIR)) {
        return "npm";
    }
    else if (isFileExists(YARN_LOCK_DIR)) {
        return "yarn";
    }
    else if (isFileExists(PNPM_LOCK_DIR)) {
        return "pnpm";
    }
    return "";
}
function preHook(DEPTH) {
    if (!isFileExists(PKG_JSON_DIR)) {
        throw new Error("\u001B[31m\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u4E3A".concat(CWD, ",\u6CA1\u6709\u53D1\u73B0package.json\u001B[0m"));
    }
    if (!isFileExists(NODE_MODULES_DIR)) {
        throw new Error("not contain node_modules");
    }
    var PKG_MANAGER = detectPackageManager();
    if (!PKG_MANAGER) {
        throw new Error("lock file lose");
    }
    var config = {
        PKG_JSON_DIR: PKG_JSON_DIR,
        NODE_MODULES_DIR: NODE_MODULES_DIR,
        PKG_MANAGER: PKG_MANAGER,
        DEPTH: DEPTH
    };
    return config;
}

function isArrContainObj(arr, obj) {
    return arr.some(function (node) { return node.id === obj.id; });
}
var DepGraph = /** @class */ (function () {
    function DepGraph() {
        this.nodes = [];
        this.edges = [];
    }
    DepGraph.prototype.insertNode = function (dependence, version, level) {
        var node = {
            id: dependence + version,
            dependence: dependence,
            version: version,
            level: level
        };
        !isArrContainObj(this.nodes, node) && this.nodes.push(node);
    };
    DepGraph.prototype.insertEgde = function (fromNodeId, toNodeId) {
        var edge = {
            source: fromNodeId,
            target: toNodeId
        };
        this.edges.push(edge);
    };
    return DepGraph;
}());

var depGraph = new DepGraph();
function recursiveDep4YarnAndNpm(dependencies, sourceId, config, level, processedDeps) {
    if (level === void 0) { level = 1; }
    if (processedDeps === void 0) { processedDeps = new Set(); }
    for (var depName in dependencies) {
        var NODE_MODULES_DIR = config.NODE_MODULES_DIR, DEPTH = config.DEPTH;
        if (level === DEPTH + 1) {
            return;
        }
        if (processedDeps.has(depName)) {
            continue;
        }
        processedDeps.add(depName);
        // 记录目标节点
        var targetId = depName + dependencies[depName];
        depGraph.insertNode(depName, dependencies[depName], level);
        depGraph.insertEgde(sourceId, targetId);
        var nestedPkgJson = path__namespace.join(NODE_MODULES_DIR, depName, "package.json");
        var content = fs__namespace.readFileSync(nestedPkgJson, {
            encoding: "utf-8"
        });
        var dep = JSON.parse(content).dependencies;
        recursiveDep4YarnAndNpm(dep, targetId, config, level + 1, processedDeps);
        processedDeps.delete(depName);
    }
}
function recursiveDep4Pnpm(dependencies, sourceId, config, level, processedDeps) {
    if (level === void 0) { level = 1; }
    if (processedDeps === void 0) { processedDeps = new Set(); }
    for (var depName in dependencies) {
        var NODE_MODULES_DIR = config.NODE_MODULES_DIR, DEPTH = config.DEPTH;
        if (level === DEPTH + 1) {
            return;
        }
        if (processedDeps.has(depName)) {
            continue;
        }
        processedDeps.add(depName);
        // 记录目标节点
        var targetId = depName + dependencies[depName];
        depGraph.insertNode(depName, dependencies[depName], level);
        depGraph.insertEgde(sourceId, targetId);
        var nestedPkgJson = "";
        if (level === 1) {
            nestedPkgJson = path__namespace.join(NODE_MODULES_DIR, depName, "package.json");
        }
        else {
            nestedPkgJson = path__namespace.join(NODE_MODULES_DIR, ".pnpm/node_modules", depName, "package.json");
        }
        var content = fs__namespace.readFileSync(nestedPkgJson, {
            encoding: "utf-8"
        });
        var dep = JSON.parse(content).dependencies;
        recursiveDep4Pnpm(dep, targetId, config, level + 1, processedDeps);
        processedDeps.delete(depName);
    }
}
function coreHook(config) {
    var PKG_JSON_DIR = config.PKG_JSON_DIR, PKG_MANAGER = config.PKG_MANAGER;
    if (PKG_MANAGER === "yarn" || PKG_MANAGER === "npm") {
        var content = fs__namespace.readFileSync(PKG_JSON_DIR, {
            encoding: "utf-8"
        });
        var _a = JSON.parse(content), dependencies = _a.dependencies, _b = _a.name, name_1 = _b === void 0 ? "YourProject" : _b, _c = _a.version, version = _c === void 0 ? "@latest" : _c;
        var sourceId = name_1 + version;
        depGraph.insertNode(name_1, version, 0);
        recursiveDep4YarnAndNpm(dependencies, sourceId, config);
    }
    // no finish
    if (PKG_MANAGER === "pnpm") {
        var content = fs__namespace.readFileSync(PKG_JSON_DIR, {
            encoding: "utf-8"
        });
        var _d = JSON.parse(content), dependencies = _d.dependencies, _e = _d.name, name_2 = _e === void 0 ? "YourProject" : _e, _f = _d.version, version = _f === void 0 ? "@latest" : _f;
        var sourceId = name_2 + version;
        depGraph.insertNode(name_2, version, 0);
        recursiveDep4Pnpm(dependencies, sourceId, config);
    }
    return depGraph;
}

var DepAnlz = /** @class */ (function () {
    function DepAnlz(depth) {
        this.depth = depth;
    }
    DepAnlz.prototype.preHook = function () {
        return preHook(this.depth);
    };
    DepAnlz.prototype.coreHook = function (config) {
        return coreHook(config);
    };
    DepAnlz.prototype.postHook = function (callback) {
        var config = preHook(this.depth);
        var depGraph = coreHook(config);
        var result = callback(config, depGraph);
        return result;
    };
    DepAnlz.prototype.lifeCycle = function () {
        var config = this.preHook();
        var depGraph = this.coreHook(config);
        return depGraph;
    };
    return DepAnlz;
}());

exports.DepAnlz = DepAnlz;
//# sourceMappingURL=index.cjs.map
