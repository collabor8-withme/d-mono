import * as http from 'http';
import { exec } from 'child_process';

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


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function webServer(config, depGraph) {
    var depthType = [
        { name: 'depth1', color: '#ff6e76', symbolSize: 200 },
        { name: 'depth2', color: '#4992ff', symbolSize: 120 },
        { name: 'depth3', color: '#7cffb2', symbolSize: 80 },
        { name: 'depth4', color: '#8d48e3', symbolSize: 50 },
        { name: 'depth5', color: '#58d9f9', symbolSize: 30 },
        { name: 'depth6', color: '#05c091', symbolSize: 25 },
        { name: 'depth7', color: '#ff8a45', symbolSize: 15 },
        { name: 'depth8', color: '#ff8a45', symbolSize: 5 },
    ];
    var option = {
        title: {
            text: "DepAnlz - @depanlz/web-server",
            left: "center",
            textStyle: {
                color: "white"
            }
        },
        tooltip: {
            trigger: "item"
        },
        color: ['#ff6e76', '#4992ff', '#7cffb2', '#8d48e3', '#58d9f9', '#05c091', '#ff8a45', '#f88a45'],
        legend: {
            right: 0,
            orient: 'vertical',
            textStyle: {
                color: "white"
            },
            padding: 20,
            itemWidth: 30,
            itemHeight: 15,
            data: ["depth1", "depth2", "depth3", "depth4", "depth5", "depth6", "depth7", "depth8"]
        },
        darkMode: true,
        backgroundColor: "#100C2A",
        series: [
            {
                type: 'graph',
                layout: 'force',
                force: {
                    edgeLength: 300,
                    repulsion: 4000,
                    gravity: 0.1
                },
                draggable: true,
                roam: true,
                edgeSymbol: ["none", "arrow"],
                edgeSymbolSize: [4, 10],
                label: {
                    show: true,
                    color: "#fff",
                    formatter: "{b}"
                },
                emphasis: {
                    focus: 'adjacency',
                    label: {
                        position: 'right',
                        show: true
                    }
                },
                lineStyle: {
                    color: "source",
                    width: 0.5,
                    curveness: 0.1,
                    opacity: 0.7
                },
                categories: depthType.slice(0, config.DEPTH),
                nodes: depGraph.nodes.map(function (node) {
                    return __assign(__assign({}, node), { name: node.id, category: node.level, symbolSize: depthType[node.level].symbolSize, itemStyle: { color: depthType[node.level].color } });
                }),
                edges: depGraph.edges,
            }
        ]
    };
    var str = JSON.stringify(option, null, 2);
    var PORT = webServer.prototype.PORT;
    http.createServer(function (req, res) {
        var html = "\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Document</title>\n</head>\n<style>\nhtml, body {\n    margin: 0;\n    padding: 0;\n    width: 100vw;\n    height: 100vh;\n}\n\n#container {\n    width: 100%;\n    height: 100%;\n}\n</style>\n<body>\n    <div id=\"container\"></div>\n    <script src=\"https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js\"></script>\n    <script>\n                const myChart = echarts.init(document.getElementById('container'));\n                myChart.showLoading();\n                myChart.hideLoading();\n                const option = ".concat(str, "\n                myChart.setOption(option);\n                console.log(echarts)\n    </script>\n</body>\n</html>\n            ");
        res.end(html);
    }).listen(PORT, function () {
        console.log("The dependency graph is rendered in http://localhost:".concat(PORT));
        // 在 Unix-like 系统中，使用 open 命令
        if (process.platform === 'darwin') {
            exec("open http://localhost:".concat(PORT));
        }
        // 在 Windows 系统中，使用 start 命令
        else if (process.platform === 'win32') {
            exec("start http://localhost:".concat(PORT));
        }
        // 在 Linux 等系统中，可以使用 xdg-open 命令
        else {
            exec("xdg-open http://localhost:".concat(PORT));
        }
    });
}

export { webServer };
//# sourceMappingURL=index.mjs.map
