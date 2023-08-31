import { Config } from '../index';
import DepGraph from './DepGraph';
declare class DepAnlz {
    depth: number;
    constructor(depth: number);
    preHook(): Config;
    coreHook(config: Config): DepGraph;
    postHook(callback: (config: Config, depGraph: DepGraph) => any): any;
    lifeCycle(): DepGraph;
}
export { DepAnlz };
//# sourceMappingURL=index.d.ts.map