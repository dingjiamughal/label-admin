module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const dataset = new Schema({
        __v: {type: Number, select: false},
        status: {type: Number, enum: [0, 1], default: 0, required: true}, // 0: 成功  1: 失败
        labelId: {type: String, required: true},

        sku: {type: String, required: true}, // sku名称
        brand: {type: String, required: true}, // 品牌名称
        param: {type: String, required: true}, // 规格参数
        type: {type: String, required: true}, // 商品类别
        package: {type: String, required: true}, // 商品包装
        vertical: {type: Number, required: true}, // 俯仰角
        horizontal: {type: Number, required: true}, // 水平方位角
        originalUrl: {type: String, required: true}, // url
        downloadDir: {type: String, required: true}, // 下载文件夹名
        imageName: {type: String, required: true}, // 下载图片名

        url: {type: String, required: true}, // 本地文件路径
        angle: {type: Number, required: false, default: 9999},
        quality: {type: Number, required: false, default: 9999}
    });

    return mongoose.model('Dataset', dataset);
};
