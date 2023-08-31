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
export { ObjifyGraph, stringifyGraph };
//# sourceMappingURL=transformGraph.js.map