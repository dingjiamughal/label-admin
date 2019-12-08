/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
    /**
     * built-in config
     * @type {Egg.EggAppConfig}
     **/
    const config = (exports = {});

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1573787054739_5370';

    // add your middleware config here
    // config.middleware = ['fileUploader'];
    // config.fileUploader = {
    //     multipart: true,
    //     formidable: {
    //         uploadDir: path.resolve(__dirname, '../public/uploads'),
    //         keepExtensions: true // 保留文件扩展名
    //     }
    // };

    config.security = {
        csrf: {
            enable: false,
            ignoreJSON: true
        },
        domainWhiteList: ['http://localhost:3000']
    };

    config.cors = {
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
        credentials: true,
        origin: '*'
    };

    config.mongoose = {
        client: {
            url: 'mongodb://127.0.0.1/labelAdmin',
            options: {
                useNewUrlParser: true
            }
        }
    };

    config.static = {};
    // add your user config here
    const userConfig = {
        // myAppName: 'egg',
    };

    return {
        ...config,
        ...userConfig
    };
};
