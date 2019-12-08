'use strict';

const multer = require('koa-multer');
const path = require('path');

const storage = multer.diskStorage({
    // 文件保存路径
    destination(req, file, cb) {
        cb(null, path.resolve(__dirname, './public/uploads'));
    },
    // 修改文件名称
    filename(req, file, cb) {
        const fileFormat = file.originalname;
        cb(null, file.originalname);
    }
});
const upload = multer({storage});
/**
 * @param {Egg.Application} app - egg application
 */

// https://eggjs.org/zh-cn/basics/router.html

// GET	    /posts	         posts	    app.controllers.posts.index
// GET	    /posts/new	     new_post	app.controllers.posts.new
// GET	    /posts/:id	     post	    app.controllers.posts.show
// GET	    /posts/:id/edit	 edit_post	app.controllers.posts.edit
// POST	    /posts	         posts	    app.controllers.posts.create
// PUT	    /posts/:id	     post	    app.controllers.posts.update
// DELETE	/posts/:id	     post	    app.controllers.posts.destroy
module.exports = app => {
    const {router, controller} = app;
    // router.get('/', controller.home.index);
    router.post('/api/upload', upload.any(), controller.home.uploadFile);
    router.get('/api/test', controller.home.test);
    router.resources('task', '/api/task', controller.task);
    router.resources('dataset', '/api/dataset', controller.dataset);
    router.resources('label', '/api/label', controller.label);

    router.post('/api/exif', controller.home.exif);
    router.post('/api/progress', controller.home.progress);
    router.post('/api/reDownLoad', controller.home.reDownLoad);
};
