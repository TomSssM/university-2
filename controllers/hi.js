const { URL } = require('url')

const hi = (router) => (req, res) => {
    const url = new URL(`${req.protocol || ''}${req.headers.host}${req.url}`);
    const name = url.searchParams.get('q');
    return name
        ? router.html(res, `
            <input type="text" readonly value="${name}" />
            <br />
            <a href="/hi">One more!</a>
        `, 'Hi')
        : router.badRequest(res, `
            <p>No name supplied</p>
            <a href="/hi">Try again</a>
        `);
};

module.exports = exports = {
    hi,
};