import * as path from 'path';
import { join } from 'path';
import * as fs from 'fs';

function isFileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
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
const CWD = process.cwd();
const PKG_JSON_DIR = join(CWD, "package.json");
const NODE_MODULES_DIR = join(CWD, "node_modules");
const NPM_LOCK_DIR = join(CWD, "package-lock.json");
const YARN_LOCK_DIR = join(CWD, "yarn.lock");
const PNPM_LOCK_DIR = join(CWD, "pnpm-lock.yaml");
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
        throw new Error(`\x1b[31m当前工作目录为${CWD},没有发现package.json\x1b[0m`);
    }
    if (!isFileExists(NODE_MODULES_DIR)) {
        throw new Error("not contain node_modules");
    }
    const PKG_MANAGER = detectPackageManager();
    if (!PKG_MANAGER) {
        throw new Error("lock file lose");
    }
    const config = {
        PKG_JSON_DIR,
        NODE_MODULES_DIR,
        PKG_MANAGER,
        DEPTH
    };
    return config;
}

function isArrContainObj(arr, obj) {
    return arr.some(node => node.id === obj.id);
}
class DepGraph {
    nodes;
    edges;
    constructor() {
        this.nodes = [];
        this.edges = [];
    }
    insertNode(dependence, version, level) {
        const node = {
            id: dependence + version,
            dependence,
            version,
            level
        };
        !isArrContainObj(this.nodes, node) && this.nodes.push(node);
    }
    insertEgde(fromNodeId, toNodeId) {
        const edge = {
            source: fromNodeId,
            target: toNodeId
        };
        this.edges.push(edge);
    }
}

const depGraph = new DepGraph();
function YARNorNPMAdapter(dependencies, sourceId, config, level = 1, processedDeps = new Set()) {
    for (const depName in dependencies) {
        const { NODE_MODULES_DIR, DEPTH } = config;
        if (level === DEPTH + 1) {
            return;
        }
        if (processedDeps.has(depName)) {
            continue;
        }
        processedDeps.add(depName);
        // 记录目标节点
        const targetId = depName + dependencies[depName];
        depGraph.insertNode(depName, dependencies[depName], level);
        depGraph.insertEgde(sourceId, targetId);
        const nestedPkgJson = path.join(NODE_MODULES_DIR, depName, "package.json");
        const content = fs.readFileSync(nestedPkgJson, {
            encoding: "utf-8"
        });
        const { dependencies: dep } = JSON.parse(content);
        YARNorNPMAdapter(dep, targetId, config, level + 1, processedDeps);
        processedDeps.delete(depName);
    }
}
function PNPMAdapter(dependencies, sourceId, config, level = 1, processedDeps = new Set()) {
    for (const depName in dependencies) {
        const { NODE_MODULES_DIR, DEPTH } = config;
        if (level === DEPTH + 1) {
            return;
        }
        if (processedDeps.has(depName)) {
            continue;
        }
        processedDeps.add(depName);
        // 记录目标节点
        const targetId = depName + dependencies[depName];
        depGraph.insertNode(depName, dependencies[depName], level);
        depGraph.insertEgde(sourceId, targetId);
        let nestedPkgJson = "";
        if (level === 1) {
            nestedPkgJson = path.join(NODE_MODULES_DIR, depName, "package.json");
        }
        else {
            nestedPkgJson = path.join(NODE_MODULES_DIR, ".pnpm/node_modules", depName, "package.json");
        }
        const content = fs.readFileSync(nestedPkgJson, {
            encoding: "utf-8"
        });
        const { dependencies: dep } = JSON.parse(content);
        PNPMAdapter(dep, targetId, config, level + 1, processedDeps);
        processedDeps.delete(depName);
    }
}
function coreHook(config) {
    const { PKG_JSON_DIR, PKG_MANAGER, } = config;
    if (PKG_MANAGER === "yarn" || PKG_MANAGER === "npm") {
        const content = fs.readFileSync(PKG_JSON_DIR, {
            encoding: "utf-8"
        });
        const { dependencies, name = "YourProject", version = "@latest" } = JSON.parse(content);
        const sourceId = name + version;
        depGraph.insertNode(name, version, 0);
        YARNorNPMAdapter(dependencies, sourceId, config);
    }
    // no finish
    if (PKG_MANAGER === "pnpm") {
        const content = fs.readFileSync(PKG_JSON_DIR, {
            encoding: "utf-8"
        });
        const { dependencies, name = "YourProject", version = "@latest" } = JSON.parse(content);
        const sourceId = name + version;
        depGraph.insertNode(name, version, 0);
        PNPMAdapter(dependencies, sourceId, config);
    }
    return depGraph;
}

class DepAnlz {
    depth;
    constructor(depth) {
        this.depth = depth;
    }
    preHook() {
        return preHook(this.depth);
    }
    coreHook(config) {
        return coreHook(config);
    }
    postHook(callback) {
        const config = preHook(this.depth);
        const depGraph = coreHook(config);
        const result = callback(config, depGraph);
        return result;
    }
    lifeCycle() {
        const config = this.preHook();
        const depGraph = this.coreHook(config);
        return depGraph;
    }
}

export { DepAnlz };
//# sourceMappingURL=index.mjs.map
