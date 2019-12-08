const BaseController = require('./base');

class LabelController extends BaseController {
    async index() {
        try {
            let labels = await this.ctx.model.Label.find({});
            this.success(labels);
        }
        catch (e) {
            this.fail(e);
        }
    }

    async create() {
        const label = this.ctx.request.body;

        try {
            let result = await this.ctx.model.Label.findOne(label);
            if (result) {
                this.fail('数据集重名');
            }
            else {
                result = await this.ctx.model.Label.create(label);
                this.success(result);
            }
        }
        catch (e) {
            this.fail(e);
        }
    }

    async update() {
        const label = this.ctx.request.body;
        const id = this.ctx.params.id;
        try {
            const result = await this.ctx.model.Label.findByIdAndUpdate(id, label);
            this.success('更新成功');

        }
        catch (e) {
            this.fail(e);
        }
    }

    async destroy() {
        const id = this.ctx.params.id;
        try {
            await this.ctx.model.Label.findByIdAndRemove(id);
            this.success('删除成功');
        }
        catch (e) {
            this.fail(e);
        }
    }
}

module.exports = LabelController;
