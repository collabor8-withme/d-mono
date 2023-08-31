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
export default DepGraph;
//# sourceMappingURL=DepGraph.js.map