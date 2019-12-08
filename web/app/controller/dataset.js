const BaseController = require('./base');

class DatasetController extends BaseController {
    async index() {
        try {
            let dataset = await this.ctx.model.Dataset.find({});
            this.success(dataset);
        }
        catch (e) {
            this.fail(e);
        }
    }

    async show() {
        try {
            const labelId = this.ctx.params.id;
            if (Object.keys(this.ctx.query).length === 0) {
                const dataset = await this.ctx.model.Dataset.find({labelId});
                this.success(dataset);
                return;
            }
            let {pageNum = 1, pageSize = 20} = this.ctx.query;
            pageNum = isNaN(pageNum) ? 1 : parseInt(pageNum, 10);
            pageSize = isNaN(pageSize) ? 20 : parseInt(pageSize, 10);
            const dataset = await this.ctx.model.Dataset.find({labelId}).skip((pageNum - 1) * pageSize).limit(pageSize);
            const total = await this.ctx.model.Dataset.countDocuments();
            this.success({
                items: dataset,
                total,
                pageNum,
                pageSize,
                pageCount: Math.ceil(total / pageSize)
            });
        }
        catch (e) {
            this.fail(e);
        }
    }

    async create() {
        const item = this.ctx.request.body;

        try {
            let result = await this.ctx.model.Dataset.findOne(item);
            if (result) {
                this.fail('数据集重名');
            }
            else {
                result = await this.ctx.model.Dataset.create(item);
                this.success(result);
            }
        }
        catch (e) {
            this.fail(e);
        }
    }

    async update() {
        const item = this.ctx.request.body;
        const id = this.ctx.params.id;
        try {
            if (item instanceof Array) {
                await item.forEach(async it => {
                    const {_id, ...rest} = it;
                    await this.ctx.model.Dataset.findByIdAndUpdate(_id, rest);
                });
                this.success('更新成功');
                return;
            }
            const result = await this.ctx.model.Dataset.findByIdAndUpdate(id, item);
            this.success('更新成功');
        }
        catch (e) {
            this.fail(e);
        }
    }

    async destroy() {
        const id = this.ctx.params.id;
        try {
            await this.ctx.model.Dataset.findByIdAndRemove(id);
            this.success('删除成功');
        }
        catch (e) {
            this.fail(e);
        }
    }
}

module.exports = DatasetController;
