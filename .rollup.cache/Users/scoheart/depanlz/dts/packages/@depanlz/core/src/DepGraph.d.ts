type DepNode = {
    id: string;
    dependence: string;
    version: string;
    level: number;
};
type DepRel = {
    source: string;
    target: string;
};
declare class DepGraph {
    nodes: Array<DepNode>;
    edges: Array<DepRel>;
    constructor();
    insertNode(dependence: string, version: string, level: number): void;
    insertEgde(fromNodeId: string, toNodeId: string): void;
}
export default DepGraph;
//# sourceMappingURL=DepGraph.d.ts.map