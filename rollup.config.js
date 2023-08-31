import fs from 'fs';
import path from 'path';
import typescript from "@rollup/plugin-typescript"
import json from '@rollup/plugin-json';
import resolve from "@rollup/plugin-node-resolve"
const packages = path.resolve(process.cwd(), 'packages/@depche');
const packageDir = fs.readdirSync(packages);

function output(pkg) {
    return [
        {
            input: [`./packages/@depche/${pkg}/src/index.ts`],
            output: [
                {
                    file: `./packages/@depche/${pkg}/dist/index.cjs`,
                    format: 'cjs',
                    sourcemap: true
                },
                {
                    file: `./packages/@depche/${pkg}/dist/index.mjs`,
                    format: 'esm',
                    sourcemap: true
                }
            ],
            plugins: [
                typescript(),
                json(),
                resolve()
            ],
            external: [
                "@depche/core",
                "@depche/web-server",
            ]
        }
    ];
}

const config = packageDir.map((item) =>output(item)).flat()

export default config
