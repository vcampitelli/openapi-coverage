import http from 'http';

/**
 * @param {String} path
 */
export default async function expressParser(path) {
    http.createServer = function () {
        console.log('listen, pô')
    };
    const module = await import(`${path}/index.js`);
    console.log(module);
}
