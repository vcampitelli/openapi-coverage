// import http from 'http';
// import {Server} from 'node:net';

/**
 * @param {String} basePath
 */
export default async function expressParser(basePath) {
    // Mocking listen
    // Server.prototype.listen = function () {
    //     console.log('Mocking Server', arguments);
    //     return this;
    // };

    const express = await import(`${basePath}/node_modules/express/index.js`);
    const mock = function () {
        if (!arguments[1]) {
            return;
        }

        console.log('mocking get', arguments);
        const regexp = /(\/[^:]+:[0-9]+):[0-9]+\)?$/;
        const stack = (new Error).stack
            .split('\n')
            .splice(1)
            .map(line => {
                const lineDetails = line.split(' at ', 2)[1];
                const regexResult = lineDetails.match(regexp);
                if ((!regexResult) || (!regexResult[1])) {
                    return '';
                }

                const file = regexResult[1];
                return file.replace(/^\/+/, '/');
            })
            .filter(file => {
                if (!file.length) {
                    return false;
                }

                return file.startsWith(basePath) && !file.includes('/node_modules/');
            });
        const [file, lineNumber] = stack[0].split(':', 2);
        console.log(
            '%s\t%s\t%s\t%s\t%d',
            'endpoint',
            'get',
            arguments[0],
            file.substring(basePath.length + 1),
            lineNumber,
        );
    };
    // express.application.get = mock;
    // const router = await import(`${basePath}/node_modules/express/lib/router/index.js`);
    // router.default.get = mock;

    express.application.listen = function () {
        // Initializing router
        this.lazyrouter();

        const endpoints = [];
        parseRouter(endpoints, this._router.stack);
        console.log(endpoints);
    };

    const parseRouter = (endpoints, stack, prefix = '') => {
        const wantedMethods = [
            'get', 'post', 'patch', 'put', 'delete',
        ];
        for (const layer of stack) {
            if (layer.name === 'router') {
                let prefix = '';
                if (layer.regexp instanceof RegExp) {
                    prefix = layer.regexp.toString();
                    if (prefix.startsWith('/^\\/')) {
                        prefix = '/' + prefix.substring(4);
                    }
                    if (prefix.endsWith('\\/?(?=\\/|$)/i')) {
                        prefix = prefix.substring(0, prefix.length - 13);
                    }
                }
                parseRouter(endpoints, layer.handle.stack, prefix)
                continue;
            }

            if (!layer.route) {
                continue;
            }
            if (!layer.route.path) {
                continue;
            }

            const availableMethods= [];
            for (const method in layer.route.methods) {
                if (layer.route.methods[method] !== true) {
                    continue;
                }
                if (wantedMethods.indexOf(method) === -1) {
                    continue;
                }
                availableMethods.push(method);
                // console.log(
                //     '%s\t%s\t%s',
                //     'endpoint',
                //     method,
                //     layer.route.path,
                // );
            }
            if (!availableMethods.length) {
                continue;
            }

            endpoints.push({
                path: `${prefix}${layer.route.path}`,
                methods: availableMethods,
            });
        }
        return endpoints;
    }

    // @TODO check for route "groups"
    const module = await import(`${basePath}/index.js`);
    // console.log(app);
}
