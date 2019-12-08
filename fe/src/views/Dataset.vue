<template>
    <div class="page-dataset">
        <div class="op-wrapper">
            <el-row style="line-height: 32px;">
                <el-col :span="12">
                    <div class="dataset-view">
                        <span class="label-text">查看数据集</span>
                        <el-select class="dataset-select" v-model="datasetSelect" placeholder="请选择" size="small">
                            <el-option
                                v-for="item in dataset"
                                :key="item._id"
                                :label="item.name"
                                :value="item._id"
                                size="small"
                            >
                            </el-option>
                        </el-select>
                        <el-button type="primary" size="small" @click="searchConfirm">确认</el-button>
                    </div>
                </el-col>
                <el-col :span="12">
                    <span class="label-text">此数据集上传进度</span>
                    <el-progress class="progress" :percentage="percentage" color="#f56c6c" v-show="isShowProgress"></el-progress>
                </el-col>
            </el-row>
        </div>
        <el-table :data="labels" style="padding: 0 8px;">
            <el-table-column prop="sku" label="sku"></el-table-column>
            <el-table-column prop="url" label="图片地址"></el-table-column>
            <el-table-column prop="vertical" label="垂直角度" width="120"></el-table-column>
            <el-table-column prop="horizontal" label="水平角度" width="120"></el-table-column>
            <el-table-column prop="quality" label="quality" width="120"></el-table-column>
            <el-table-column prop="angle" label="angle" width="120"></el-table-column>
        </el-table>
        <el-pagination
            class="pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
        >
        </el-pagination>
    </div>
</template>

<script>
import {mapState, mapActions, mapMutations} from 'vuex';
export default {
    data() {
        return {
            datasetSelect: '',
            percentage: 0,
            isShowProgress: true
        };
    },
    async created() {
        await this.getDataset();
        if (this.dataset.length === 0) {
            return;
        }
        this.datasetSelect = this.dataset[0]._id;
        this.checkProgress();
    },
    computed: {
        ...mapState({
            dataset: state => state.dataset,
            labels: state => state.labels,
            pageSize: state => state.pageSize,
            currentPage: state => state.currentPage,
            total: state => state.total
        })
    },
    methods: {
        ...mapActions([
            'getDataset',
            'getLabelList'
        ]),
        ...mapMutations([
            'setPageNo',
            'setPageSize',
            'initPagination'
        ]),
        searchConfirm() {
            this.initPagination();
            this.getLabelList(this.datasetSelect);
            this.setPercentage();
        },
        handleSizeChange(pageSize) {
            this.setPageSize(pageSize);
            this.getLabelList(this.datasetSelect);
        },
        handleCurrentChange(currentPage) {
            this.setPageNo(currentPage);
            this.getLabelList(this.datasetSelect);
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
        background: #f4f4f5;
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
</style>