import preHook from "./hooks/preHook";
import coreHook from "./hooks/coreHook";
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
//# sourceMappingURL=index.js.map