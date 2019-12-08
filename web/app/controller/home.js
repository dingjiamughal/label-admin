'use strict';

const fs = require('fs');
const util = require('util');
const childProcess = require('child_process');
const request = require('request');
const rp = require('request-promise');
const asyncMap = require('async/map');
const path = require('path');
const ExifTransformer = require('exif-be-gone');
const Bagpipe = require('bagpipe');
const BaseController = require('./base');

const bagpipe = new Bagpipe(10);

class HomeController extends BaseController {
    async test() {
        this.ctx.body = {
            test: 123
        };
    }
    async uploadFile() {
        const {taskname} = this.ctx.req.body; // taskId
        const datasetName = this.ctx.req.files[0].originalname;
        console.log(taskname, datasetName)
        const readFile = util.promisify(fs.readFile);
        const data = await readFile(path.resolve(__dirname, `../public/uploads/${datasetName}`), 'utf8');
        const keyArray = data.split(/\n/)[0].split(','); // [sku名称, 品牌名称, 规格参数, ...]
        const getIndex = key => keyArray.findIndex(item => item === key);

        let labelId = '';
        try {
            let label = await this.ctx.model.Label.findOne({name: datasetName});
            if (label) {
                this.fail('此数据集已经存在');
                return;
            }
            else {
                label = await this.ctx.model.Label.create({name: datasetName, taskId: taskname, count: 0});
                labelId = label._id;
                this.success({name: label.name});
            }
        }
        catch (e) {
            this.fail(e);
            return;
        }

        const lists = data.split(/\n/).filter(Boolean).slice(1); // [sku1, sku2, sku3, ...]

        await this.ctx.model.Label.findByIdAndUpdate(labelId, {count: lists.length});
        const mkDir = util.promisify(fs.mkdir);
        await mkDir(path.resolve(__dirname, `../public/images/${datasetName}`));

        const keyMapping = {
            sku: 'SKU名称',
            brand: '品牌名称',
            param: '规格参数',
            type: '商品类别',
            package: '商品包装',
            vertical: '俯仰角',
            horizontal: '水平方位角',
            originalUrl: 'url',
            downloadDir: '下载文件夹名',
            imageName: '下载图片名'
        };
        const imgObj = str => {
            return str.split(',').reduce((memo, next, index) => {
                const columnName = keyArray[index]; // keyMapping 的 value
                const key = Object.keys(keyMapping).find(item => keyMapping[item] === columnName);
                memo[key] = next;
                return memo;
            }, {labelId});
        };
        lists.forEach((item, index) => {
            const img = imgObj(item);
            bagpipe.push(writeImage, datasetName, img.originalUrl, img.imageName, async (status, imageName) => {
                if (status === 'success') {
                    await this.ctx.model.Dataset.create({
                        status: 0,
                        ...img,
                        url: `/public/images/${datasetName}/${img.imageName}`,
                        vertical: Number(img.vertical),
                        horizontal: Number(img.horizontal)
                    });
                    console.log('success');
                }
                if (status === 'error') {
                    await this.ctx.model.Dataset.create({
                        status: 1,
                        ...img,
                        url: `/public/images/${datasetName}/${img.imageName}`,
                        vertical: Number(img.vertical),
                        horizontal: Number(img.horizontal)
                    });
                    console.log('error', imageName);
                }
            });
        });
    }
    async exif() {
        const {datasetId} = this.ctx.request.body;
        const {name} = await this.ctx.model.Label.findById(datasetId); // 文件夹名
        const inputDir = path.resolve(__dirname, `../public/images/${name}`);
        const outDir = path.resolve(__dirname, `../public/images/${name}__exif`);

        const mkDir = util.promisify(fs.mkdir);
        await mkDir(outDir);

        const workerProcess = childProcess.exec(`python ${path.resolve(__dirname, '../lib/exif.py')} ${inputDir} ${outDir}`, (error, stdout, stderr) => {
            if (error) {
                console.log(error.stack);
                console.log('Error code: ' + error.code);
                console.log('Signal received: ' + error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        });
        workerProcess.on('exit', function (code) {
            console.log('子进程已退出，退出码 ' + code);
        });
    }
    async progress() {
        // type: download / exif
        const {taskId, datasetId} = this.ctx.request.body;
        // datasetId: 0 全部
        if (!datasetId) {
            const task = await this.ctx.model.Task.findById(taskId);
            const datasets = await this.ctx.model.Label.find({taskId});
            const result = await asyncMap(datasets, async dataset => {
                const total = dataset.count;
                const errorList = await this.ctx.model.Dataset.find({labelId: dataset._id, status: 1});
                const exifFileDir = path.resolve(__dirname, `../public/images/${dataset.name}__exif`);
                const exifStatus = !errorList.length && fs.existsSync(exifFileDir); // 是否存在exif文件夹
                let exifCompleteCount = 0;
                if (exifStatus) {
                    exifCompleteCount = fs.readdirSync(exifFileDir).length;
                }
                return {
                    id: dataset._id,
                    taskName: task.name,
                    datasetName: dataset.name,
                    total,
                    download: {
                        isComplete: !errorList.length,
                        errorList,
                        percentage: +((total - errorList.length) / total * 100).toFixed(2)
                    },
                    exif: {
                        isComplete: exifCompleteCount === total,
                        end: exifCompleteCount,
                        percentage: +((exifCompleteCount / total) * 100).toFixed(2)
                    },
                    info: {}
                };
            });
            this.success(result);
        }
        // if (type === 'download') {
            // const {name, count} = await this.ctx.model.Label.findById(datasetId);
            // const errorList = await this.ctx.model.Dataset.find({labelId: datasetId, status: 1});
            // const completeCount = await this.ctx.model.Dataset.find({labelId: datasetId, status: 0}).countDocuments();
            // console.log(errorList);
            // this.success({errorList, count, completeCount});
        // }
    }
    async reDownLoad() {
        const {datasetId} = this.ctx.request.body;
        const errorList = await this.ctx.model.Dataset.find({labelId: datasetId, status: 1});
        const {name: dirname} = await this.ctx.model.Label.findById(datasetId);
        errorList.forEach(item => {
            bagpipe.push(writeImage, dirname, item.originalUrl, item.imageName, async (status, imageName) => {
                if (status === 'success') {
                    await this.ctx.model.Dataset.findByIdAndUpdate(item._id, {
                        $set: {status: 0}
                    });
                    console.log('success')
                }
            });
        });
    }
}

function writeImage(dir, url, name, callback) {
    // console.log('name', name);
    const filePath = path.resolve(__dirname, `../public/images/${dir}/${name}`);
    rp.get({
        url: encodeURI(url),
        encoding: 'binary',
        timeout: 3000
    })
    .then(data => {
        fs.writeFile(filePath, data, 'binary', err => {
            callback('success', name);
        });
    })
    .catch(err => {
        callback('error', name);
    });
    // const readStream = request.get({
    //     url: encodeURI(url),
    //     // timeout: 3000
    // }, error => {
    //     console.log('success');
    //     if (error) {
    //         callback('error', name);
    //         console.log('error');
    //     }
    // });
    // const writeStream = fs.createWriteStream(filePath);
    // readStream.pipe(writeStream);

    // readStream.on('end', response => {
    //     readStream.end();
    // });
    // readStream.on('error', error => {
    //     writeStream.end();
    //     fs.unlinkSync(filePath);
    //     readStream.end();
    // });

    // writeStream
    //     .on('finish', () => {
    //         readStream.end();
    //         writeStream.end();
    //     })
    //     .on('error', err => {
    //         readStream.end();
    //         writeStream.end();
    //     });
}

module.exports = HomeController;
