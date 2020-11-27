const http = require('http');

const { Router } = require('./router');
const { hi, ajax } = require('./controllers');

const port = process.env.PORT || 8080;

const router = new Router({
    rootDir: __dirname,
});

router.addRoute('/', router.servePage('index'));

// 1st task
router.addRoute('/hi', router.servePage('hi'));
router.addRoute('/cs/hi', hi(router));

// 2nd task
router.addRoute('/google', router.servePage('google'));

// 3rd task
router.addRoute('/ajax', router.servePage('ajax'));
router.addRoute('/cs/ajax', ajax);

router.staticDirectory('static');

http.createServer(router.listen()).listen(port, () => {
    console.log(`Listening on ${port}...`);
});
