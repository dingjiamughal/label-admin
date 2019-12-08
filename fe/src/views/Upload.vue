<template>
    <div class="page-upload">
        <div class="op-wrapper">
            <el-row style="margin-bottom: 10px;">
                <el-col :span="18">
                    <el-cascader
                        v-model="pipelineValue"
                        :options="pipelineOptions"
                        :props="{expandTrigger: 'hover'}"
                        @change="handleChangepipeline"
                        size="mini"
                    ></el-cascader>
                    </el-col>
                <el-button type="" plain size="small" @click="isShowUpload = true">新增数据集</el-button>
            </el-row>
        </div>
        <div class="pipeline-wrapper">
            <div class="ops">
                <span class="el-icon-refresh refresh"></span>
            </div>
            <div class="pipeline-item" v-for="(pipeline, index) in pipelineList" :key="pipeline.datasetName">
                <div class="info-wrapper">
                    <div class="titles-wrapper">
                        <div class="task-name">任务名：{{pipeline.taskName}}</div>
                        <div class="dataset-name">数据集：{{pipeline.datasetName}}</div>
                    </div>
                </div>
                <div class="process-wrapper">
                    <div class="process-dashboard">
                        <div class="pipeline-item-process" :class="{active: pipeline.isShowDownload}" @click="handleClickProcessItem('download', index)">
                            <span class="pipeline-process-title">上传</span>
                            <el-progress :text-inside="true" :stroke-width="14" :percentage="pipeline.download.percentage" color="#e57471"></el-progress>
                            <div class="run" @click.stop="runExif(pipeline.id, pipeline.download.isComplete)" :class="{active: pipeline.download.isComplete}">
                                <i class="el-icon-caret-right"></i>
                                <span>执行</span>
                            </div>
                        </div>
                        
                        <div class="pipeline-item-process" :class="{active: pipeline.isShowExif}" @click="handleClickProcessItem('exif', index)">
                            <span class="pipeline-process-title">去除exif</span>
                            <el-progress :text-inside="true" :stroke-width="14" :percentage="pipeline.exif.percentage" color="#e57471"></el-progress>
                            <div class="run" @click="runProgress">
                                <i class="el-icon-caret-right"></i>
                                <span>执行</span>
                            </div>
                        </div>
                        <div class="pipeline-item-process" :class="{active: pipeline.isShowInfo}" @click="handleClickProcessItem('info', index)">
                            <span class="pipeline-process-title">模型预估</span>
                            <el-progress :text-inside="true" :stroke-width="14" :percentage="0" color="#e57471"></el-progress>
                        </div>
                    </div>
                    <div class="process-detail" v-show="isShowProcessDetail">
                        <section v-show="pipeline.isShowDownload">
                            <div v-if="!pipeline.download.errorList.length" class="download-tip">图片已经全部成功上传</div>
                            <div v-else class="download-wrapper">
                                <div class="title-wrapper">
                                    <span class="title">下载失败的图片们：</span>
                                    <label class="re-wrapper">
                                        <el-link type="danger" :underline="false" style="margin-right: 8px;" @click="reDownLoad">重新下载</el-link>
                                        <el-link type="info" :underline="false">刷新</el-link>
                                    </label>
                                </div>
                                <div class="download-list-wrapper">
                                    <el-table :data="pipeline.download.errorList" height="250" border>
                                        <el-table-column prop="sku" label="SKU名称" width="180"></el-table-column>
                                        <el-table-column prop="imageName" label="下载图片名" width="180"></el-table-column>
                                        <el-table-column prop="originalUrl" label="url"></el-table-column>
                                    </el-table>
                                </div>
                            </div>
                            
                        </section>
                        <section class="exif-wrapper" v-show="pipeline.isShowExif">
                            exif...
                        </section>
                        <section class="info-wrapper" v-show="pipeline.isShowInfo">
                            info...
                        </section>
                    </div>
                </div>
                
                
            </div>
        </div>
        <el-dialog title="数据集上传" :visible.sync="isShowUpload">
            <el-form :model="uploadForm" ref="uploadForm" label-width="120px">
                <el-form-item label="任务名称" prop="taskname">
                    <el-select v-model="uploadForm.taskname" placeholder="请选择任务名" size="mini">
                        <el-option
                            v-for="item in tasks"
                            :key="item._id"
                            :label="item.name"
                            :value="item._id">
                        </el-option>
                    </el-select>
                    <span class="add-link" @click="isShowUploadInner = true" size="mini">新建任务</span>
                </el-form-item>
                <el-form-item label="选择数据集" label-width="120px">
                    <el-upload
                        class="upload"
                        ref="upload"
                        :action="uploadUrl"
                        :auto-upload="false"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :file-list="fileList"
                        :data="uploadForm"
                        :limit="1"
                        accept=".csv"
                    >
                        <el-button slot="trigger" size="mini" type="primary">选取文件</el-button>
                    </el-upload>
                </el-form-item>
            </el-form>
                <el-dialog
                    width="30%"
                    title="新建任务名"
                    :visible.sync="isShowUploadInner"
                    append-to-body
                >
                    <el-form :model="uploadFormInner" ref="uploadFormInner" label-width="80px">
                        <el-form-item label="任务名称" prop="taskname">
                            <el-input v-model="uploadFormInner.taskname" placeholder="请输入任务名" size="mini"></el-input>
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="isShowUploadInner = false" size="mini">取 消</el-button>
                        <el-button type="primary" @click="addTaskName" size="mini">确 定</el-button>
                    </div>
                </el-dialog>
            <div slot="footer" class="dialog-footer">
                <el-button @click="isShowUpload = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="submitUpload" size="mini">提 交</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {mapState, mapActions, mapMutations} from 'vuex';
export default {
    data() {
        return {
            fileList: [],
            labelId: null,
            datasetSelect: '',
            percentage: 0,
            isShowProgress: true,
            uploadForm: {
                taskname: ''
            },
            uploadFormInner: {
                taskname: ''
            },
            isShowUpload: false,
            isShowUploadInner: false,
            uploadUrl: process.env.NODE_ENV === 'production' ? '/api/upload' : 'http://127.0.0.1:7001/api/upload',
            pipelineOptions: [],
            pipelineValue: [],
            isShowProcessDetail: false,
            processSwitch: '',
            pipelineList: []
        };
    },
    async created() {
        await Promise.all([this.getDataset(), this.getTask()]);
        console.log(this.tasks);
        console.log(this.dataset);
        if (!this.tasks.length || !this.dataset.length) {
            return;
        }
        this.pipelineValue = [this.tasks[0]._id, this.dataset.find(item => item.taskId === this.tasks[0]._id)._id];
        this.pipelineOptions = this.tasks.map(task => {
            const children = [{value: 0, label: '全部数据集'}];
            this.dataset.forEach(item => {
                if (item.taskId === task._id) {
                    children.push({
                        value: item._id,
                        label: item.name
                    });
                }
            });
            return {label: task.name, value: task._id, children};
        });
    },
    computed: {
        ...mapState({
            tasks: state => state.tasks,
            dataset: state => state.dataset,
            labels: state => state.labels,
            labelsAll: state => state.labelsAll,
            pageSize: state => state.pageSize,
            currentPage: state => state.currentPage,
            total: state => state.total
        })
    },
    methods: {
        ...mapActions([
            'getTask',
            'getDataset',
            'getLabelList',
            'getLabelListAll'
        ]),
        ...mapMutations([
            'setPageNo',
            'setPageSize',
            'initPagination'
        ]),
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePreview(file) {
            console.log(file);
        },
        handleExceed() {
            this.$message.warning('一次只允许上传一个文件');
        },
        submitUpload() {
            console.log(this.uploadForm);
            this.$refs.upload.submit();
            // this.getDataset();
            this.$refs.uploadForm.resetFields();
        },
        setPercentage() {
            const {count} = this.dataset.find(item => item._id === this.datasetSelect);
            this.percentage = Number((this.total / count * 100).toFixed(2));
        },
        async checkProgress() {
            await this.getLabelList(this.datasetSelect);
            this.setPercentage();

            let timer = setInterval(async () => {
                await this.getLabelList(this.datasetSelect);
                this.setPercentage();

                if (this.percentage === 100) {
                    clearInterval(timer);
                }
            }, 10000);
        },
        async addTaskName() {
            const name = this.uploadFormInner.taskname;
            const result = await this.http.post('/task', {name});
            console.log(result);
        },
        async handleChangepipeline() {
            console.log(this.pipelineValue);
            const result = await this.http.post('/progress', {
                taskId: this.pipelineValue[0],
                datasetId: this.pipelineValue[1]
            });
            const pipelineList = result.data.data;
            console.log(pipelineList);
            pipelineList.forEach(item => {
                item.isShowDownload = false;
                item.isShowExif = false;
                item.isShowInfo = false;
            });
            this.pipelineList = pipelineList;
        },
        runExif(datasetId, isComplete) {
            // this.http.post('/exif', {
            //     datasetId: this.pipelineValue[1]
            // });
            console.log(datasetId, isComplete);
            if (!isComplete) {
                return;
            }
        },
        async runProgress() {
            const result = await this.http.post('/progress', {
                datasetId: this.pipelineValue[1],
                type: 'download'
            });
            console.log(result)
        },
        async handleClickProcessItem(type, index) {
            this.isShowProcessDetail = true;
            const typeMapping = {
                download: 'isShowDownload',
                exif: 'isShowExif',
                info: 'isShowInfo'
            };
            Object.entries(typeMapping).forEach(([k, v]) => {
                this.$set(this.pipelineList[index], v, k === type && !this.pipelineList[index][v]);
            });
        },
        async reDownLoad() {
            await this.http.post('/reDownLoad', {datasetId: this.pipelineValue[1]});
            
        }
    },
    watch: {
        datasetSelect() {
            // this.checkProgress();
        }
    }
};
</script>

<style lang="less" scoped>
.op-wrapper {
    padding: 8px 15px;

    .progress {
        display: inline-block;
        width: 200px;
        white-space: nowrap;
    }
}
.page-upload {
}
.upload {
    display: inline-block;
}
.label-text {
    display: inline-block;
    margin-right: 10px;
}

.dataset-input,
.dataset-select {
    width: 50%;
}

.dataset-select {
    margin-right: 8px;
}

.pagination {
    margin-top: 10px;
    padding-left: 15px;
}

.add-link {
    cursor: pointer;
    margin-left: 10px;

    &:hover {
        color: #000;
        text-decoration: underline;
    }
}

.pipeline-wrapper {
    padding: 8px 15px;
    font-size: 14px;
    color: #303133;

    .ops {
        margin-bottom: 5px;
        padding-right: 20px;
        overflow: hidden;

        .refresh {
            font-size: 30px;
            float: right;
            cursor: pointer;
        }
    }

    .pipeline-item {
        padding: 8px;
        margin-bottom: 20px;
        border: 1px solid #e6e6e6;

        &:last-child {
            margin-bottom: 0;
        }

        .info-wrapper {
            display: inline-block;
            width: 15%;
            vertical-align: top;

            .titles-wrapper {
                padding-top: 20px;

                .task-name {
                    margin-bottom: 5px;
                }
            }
        }
        .process-wrapper {
            display: inline-block;
            width: 85%;
        }

        .process-detail {
            padding: 10px 0;

            .download-tip {
                text-align: center;
            }

            .download-wrapper {
                .title-wrapper {
                    margin-bottom: 10px;
                    // font-size: 12px;

                    .title {
                        color: #F56C6C;
                    }

                    .re-wrapper {
                        float: right;
                    }
                }
            }
        }
        .process-dashboard {
            display: flex;
            flex: 1;

            .pipeline-item-process {
                flex: 1;
                position: relative;
                cursor: pointer;
                padding: 20px 50px 20px 0;
                border: 1px solid transparent;

                &.active {
                    border: 1px solid #409EFF;
                }

                &:hover {
                    // border: 1px solid #409EFF;
                    background: #eef5fe;
                }

                .pipeline-process-title {
                    display: inline-block;
                    margin-bottom: 4px;
                }

                .run {
                    position: absolute;
                    top: 50%;
                    right: -2px;
                    margin-top: -3px;
                    width: 50px;
                    height: 20px;
                    line-height: 20px;
                    text-align: center;
                    // border-radius: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    border: 1px solid #e6e6e6;
                    cursor: not-allowed;
                    color: #ccc;

                    &.active {
                        color: #000;
                        cursor: pointer;

                        &:hover {
                            color: #409eff;
                            border-color: #409eff;
                        }
                    }
                    
                }
            }
        }
    }
}
</style>
