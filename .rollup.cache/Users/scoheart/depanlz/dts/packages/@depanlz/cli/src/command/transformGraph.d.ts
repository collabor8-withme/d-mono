import { DepGraph } from "@depche/core";
type DependenciesTree = {
    name: string;
    version: string;
    depth: number;
    dependencies: DependenciesTree[] | null;
};
declare function stringifyGraph(depGraph: DepGraph): string;
declare function ObjifyGraph(depGraph: DepGraph): DependenciesTree;
export { ObjifyGraph, stringifyGraph };
//# sourceMappingURL=transformGraph.d.ts.map