const path = require('path');
const fs = require('fs');

const FILE_TO_CONTENT_TYPE = {
    html: 'text/html',
    json: 'application/json',
};

const HEADERS = {
    CONTENT_TYPE: 'Content-Type',
};

class Router {
    constructor({
        rootDir
    }) {
        this._rootDir = rootDir;
        this._staticDirectory = null;
        this._middleware = [this._staticMiddleware.bind(this)];
    }

    addRoute(path, middleware) {
        if (typeof middleware === 'function') {
            this._middleware.push((req, res, next) => {
                const [requestedPath] = req.url.split('?');
                if (requestedPath === path) {
                    return middleware(req, res, next);
                }
                return next();
            });
        }
    }

    staticDirectory(directory) {
        if (typeof directory === 'string') {
            this._staticDirectory = path.join(this._rootDir, directory);
        }
    }

    listen() {
        return this._middleware
            .map(middleware => middleware.bind(this))
            .reduceRight((next, middleware) => {
                return (req, res) => middleware(req, res, () => next(req, res));
            }, this.notFound.bind(this));
    }

    servePage(pageName) {
        return (req, res) => {
            return this._servePage(res, pageName, 200);
        };
    }

    notFound(req, res) {
        return this._servePage(res, '404', 404);
    }

    error(req, res) {
        return this._servePage(res, '500', 500);
    }

    html(res, content, title, status = 200) {
        res.writeHead(status, {
            [HEADERS.CONTENT_TYPE]: FILE_TO_CONTENT_TYPE.html,
        });
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
            </head>
            <body>
            ${content}
            </body>
            </html>
        `);
    }

    badRequest(res, explanation = 'Try again...') {
        return this.html(res, `
            <h1>Bad request</h1>
            ${explanation}
        `, 'Bad request', 400);
    }

    _servePage(res, pageName, status = 200) {
        res.statusCode = status;
        const pagePath = path.join(this._rootDir, `pages/${pageName}.html`);
        return this._serveFile(res, pagePath);
    }

    _serveFile(res, pathToStatic) {
        const fileExtension = pathToStatic.split('/').pop().split('.').pop();
        const contentType = FILE_TO_CONTENT_TYPE[fileExtension];
        if (contentType) {
            res.writeHead(res.statusCode, {
                [HEADERS.CONTENT_TYPE]: contentType,
            });
        }
        const file = fs.createReadStream(pathToStatic);
        file.pipe(res).on('error', () => {
            res.writeHead(500, {
                [HEADERS.CONTENT_TYPE]: FILE_TO_CONTENT_TYPE.html,
            });
            res.end('Internal server error!');
        });
        res.on('close', () => file.destroy());
    }

    _staticMiddleware(req, res, next) {
        if (this._staticDirectory === null) return next();
        const [requestedPath] = req.url.split('?');
        const pathToStatic = path.join(this._staticDirectory, requestedPath);
        fs.stat(pathToStatic, (err, stats) => {
            if (!stats || stats.isDirectory()) return next();
            if (err) return this.error(req, res);
            return this._serveFile(res, pathToStatic);
        });
    }
}

module.exports = exports = {
    Router,
};
