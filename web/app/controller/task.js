const BaseController = require('./base');

class TaskController extends BaseController {
    async index() {
        try {
            let task = await this.ctx.model.Task.find({});
            this.success(task);
        }
        catch (e) {
            this.fail(e);
        }
    }

    async create() {
        const task = this.ctx.request.body;

        try {
            let result = await this.ctx.model.Task.findOne(task);
            if (result) {
                this.fail('任务名重名');
            }
            else {
                result = await this.ctx.model.Task.create(task);
                this.success(result);
            }
        }
        catch (e) {
            this.fail(e);
        }
    }

    async update() {
        const task = this.ctx.request.body;
        const id = this.ctx.params.id;
        try {
            const result = await this.ctx.model.Task.findByIdAndUpdate(id, task);
            this.success('更新成功');

        }
        catch (e) {
            this.fail(e);
        }
    }

    async destroy() {
        const id = this.ctx.params.id;
        try {
            await this.ctx.model.Task.findByIdAndRemove(id);
            this.success('删除成功');
        }
        catch (e) {
            this.fail(e);
        }
    }
}

module.exports = TaskController;
