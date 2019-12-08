<template>
    <div class="page-angle">
        <choose-input :lists="dataset" @start="start"></choose-input>
        <div class="sku-list" v-loading="loading">
            <div class="sku-list-item" v-for="(item, index) in skuList" :key="index">
                <div class="">
                    <el-tag class="sku-tag">{{item.sku}}</el-tag>
                    <i class="el-icon-edit angle-edit-total" @click="handleEditItem(index)">批量修改</i>
                </div>

                <div class="sku-list-img-wrapper">
                    <div
                        class="sku-item-img"
                        :class="{selected: img.isShowCalc}"
                        v-for="(img, idx) in item.list"
                        :key="img._id"
                    >
                        <el-image class="sku-img" :src="`http://127.0.0.1:7001${img.url}`" lazy></el-image>
                        <el-tag class="angle-tag" :class="{'angle-tag-active': img.isShowCalc}" size="mini">
                            <div>
                                <span>{{img.horizontal}}</span>
                                
                            </div>
                            <div class="edit-wrapper">
                                <i
                                    class="el-icon-circle-check confirm-icon"
                                    @click="handleChangeAngle(img._id, img.horizontal, index, idx)"
                                ></i>
                                <i
                                    class="el-icon-circle-close confirm-icon"
                                    @click="handleCloseAngle(index, idx)"
                                ></i>
                                <el-input-number
                                    class="angle-num"
                                    v-model="img.horizontal"
                                    :step="15"
                                    :min="0"
                                    :max="360"
                                    controls-position="right"
                                    step-strictly
                                    size="small"
                                ></el-input-number>
                            </div>
                        </el-tag>
                        <div class="op-wrapper">
                            <i class="el-icon-edit angle-edit" @click="handleEdit(index, idx)"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <el-drawer :title="drawerTitle" :visible.sync="drawer" direction="btt" size="75%" class="draw-modal">
            <div class="ck-wrapper">
                <el-checkbox v-model="isAutoAngle">是否一键修改</el-checkbox>
                <div class="refresh" @click="drawRefresh">
                    <i class="el-icon-refresh-right"></i>
                    <span>还原</span>
                </div>
            </div>
            <div class="draw-img-wrapper">
                <div class="draw-img-vertical-item" v-for="chunk in drawListChunk" :key="chunk.vertical">
                    <el-tag class="sku-tag" size="mini">俯仰角：{{chunk.vertical}}°</el-tag>
                    <div class="draw-img-vertical-list">
                        <div class="draw-img-item" :class="{selected: item.isShowCalc}" v-for="item in chunk.lists" :key="item._id">
                            <!-- <el-tag class="sku-tag">{{item.horizontal}}</el-tag> -->
                            <el-image class="draw-sku-img" :src="`http://127.0.0.1:7001${item.url}`"></el-image>
                            <el-input-number
                                class="draw-input"
                                v-model="item.horizontal"
                                :step="15"
                                step-strictly
                                size="small"
                                @change="handleChangeDraw(item._id)"
                            ></el-input-number>
                        </div>
                    </div>
                </div>
                
            </div>
            <div class="btns">
                <el-button type="danger" @click="drawSave" size="small">保存</el-button>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import _ from 'lodash';
import ChooseInput from '@/components/ChooseDataset';
import {mapState, mapActions, mapMutations} from 'vuex';

export default {
    async created() {
        this.getDataset();
    },
    data() {
        return {
            datasetId: '',
            skuList: [],
            drawer: false,
            drawerTitle: '',
            drawList: [],
            lineIndex: 0,
            isAutoAngle: false,
            isSelected: false,
            diffNumber: 0,
            loading: false
        };
    },
    components: {
        ChooseInput
    },
    computed: {
        ...mapState(['dataset', 'labelsAll']),
        drawListChunk() {
            const verticalArr = [...new Set(this.drawList.map(item => item.vertical))].sort((a, b) => a - b);
            // 按照垂直角度，分chunk
            return verticalArr.reduce((memo, next) => {
                const chunk = [];
                this.drawList.forEach(item => {
                    if (item.vertical === next) {
                        chunk.push(item);
                    }
                });
                memo.push({vertical: next, lists: chunk});
                return memo;
            }, []);
        }
    },
    methods: {
        ...mapActions([
            'getDataset',
            'getLabelListAll'
        ]),
        async start(val) {
            this.datasetId = val;
            this.getLabelList();
        },
        async getLabelList() {
            this.loading = true;
            await this.getLabelListAll(this.datasetId);
            this.loading = false;
            const datasetType = [...new Set(this.labelsAll.map(item => item.sku))];

            this.skuList = datasetType.reduce((memo, next) => {
                const chunk = [];
                this.labelsAll.forEach(list => {
                    if (list.sku === next) {
                        chunk.push({
                            isShowCalc: false,
                            ...list
                        });
                    }
                });
                memo.push({
                    sku: next,
                    list: chunk.sort((a, b) => a.horizontal - b.horizontal)
                });
                return memo;
            }, []);
        },
        handleEdit(index, idx) {
            this.$set(this.skuList[index].list[idx], 'isShowCalc', true);
        },
        async handleChangeAngle(id, horizontal, index, idx) {
            try {
                const result = await this.http.put(`/dataset/${id}`, {horizontal});
                this.$message({
                    message: result.data.data,
                    type: 'success',
                    duration: 600
                });
                this.$set(this.skuList[index].list[idx], 'isShowCalc', false);
            } catch (e) {
                this.$message({
                    message: e,
                    type: 'warning',
                    duration: 1000
                });
            }
        },
        handleCloseAngle(index, idx) {
            this.$set(this.skuList[index].list[idx], 'isShowCalc', false);
        },
        handleEditItem(index) {
            this.lineIndex = index;
            this.drawList = _.cloneDeep(this.skuList[index].list);
            this.drawerTitle = this.skuList[index].sku;
            this.drawer = true;
        },
        drawRefresh() {
            this.drawList = _.cloneDeep(this.skuList[this.lineIndex].list);
        },
        handleChangeDraw(id) {
            if (!this.isAutoAngle) {
                return;
            }
            const {vertical, horizontal: cur} = this.drawList.find(item => item._id === id);
            const old = this.skuList[this.lineIndex].list.find(item => item._id === id).horizontal;
            const diffNumber = Math.round((cur - old) / 15) * 15;

            this.drawList.forEach((item, index) => {
                if (item.vertical !== vertical) {
                    return false;
                }
                let nowAngle = this.skuList[this.lineIndex].list[index].horizontal + diffNumber;
                if (nowAngle < 0) {
                    nowAngle = 345;
                }
                if (nowAngle > 345) {
                    nowAngle = 15;
                }
                item.horizontal = nowAngle;
            });
        },
        async drawSave() {
            const data = this.drawList.map(({_id, horizontal}) => ({_id, horizontal}));
            try {
                const result = await this.http.put(`/dataset/${this.datasetId}`, data);
                this.$message({
                    message: result.data.data,
                    type: 'success',
                    duration: 600
                });
                this.drawer = false;
                this.getLabelList();
            }
            catch (e) {
                this.$message({
                    message: e,
                    type: 'warning',
                    duration: 600
                });
            }
        }
    }
};
</script>

<style lang="less">
.page-angle {
    padding: 8px 15px;
}

.sku-list {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: calc(100% - 120px);
    overflow-y: auto;
    margin-top: 20px;

    &-item {
        margin-bottom: 20px;
        border-bottom: 1px solid #e6e6e6;
        width: 100%;

        .angle-edit-total {
            margin-left: 10px;
            font-size: 18px;
            vertical-align: middle;
            cursor: pointer;

            &:hover {
                color: #409eff;
            }
        }
    }

    .sku-tag {
        margin: 0 0 10px 5px;
    }

    .sku-list-img-wrapper {
        width: 100%;
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;

        .sku-item-img {
            display: inline-block;
            width: 120px;
            padding: 5px;
            margin-right: 5px;
            cursor: pointer;
            position: relative;

            &.selected {
                border: 1px solid #333;
            }

            &:hover {
                .op-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }

            .op-wrapper {
                display: none;
                position: absolute;
                width: 100%;
                top: 0;
                bottom: 0;
                left: 0;
                background-color: rgba(163, 184, 226, .4);
                font-size: 30px;
                color: #000;
                font-weight: 700;

                .angle-edit {
                    &:hover {
                        color: #F56C6C;
                    }
                }
            }

            .edit-wrapper {
                display: none;
            }

            .angle-tag {
                position: absolute;
                left: 0;
                opacity: .7;
                z-index: 999;

                &-active {
                    height: 34px;
                    width: 100%;

                    & + .op-wrapper {
                        display: none;
                    }

                    .edit-wrapper {
                        display: block;
                        position: absolute;
                        top: 0;
                    }

                    .angle-num {
                        width: 100px;
                        float: left;
                    }

                    .confirm-icon {
                        font-size: 16px;
                        margin: 8px 0 0 4px;
                        transition: all .2s;
                        font-weight: 700;
                        position: absolute;
                        right: -18px;

                        &:first-child {
                            top: -8px;
                        }

                        &:nth-child(2) {
                            top: 8px;
                        }

                        &:hover {
                            color: #f56c6c;
                        }
                    }
                }
            }
        }
    }
}

.draw-modal {
    .ck-wrapper {
        padding-left: 20px;

        .refresh {
            display: inline-block;
            margin-left: 10px;
            font-size: 14px;
            color: #606266;
            font-weight: 500;
            cursor: pointer;

            &:hover {
                color: #409eff;
            }

            span {
                padding-left: 4px;
                line-height: 19px;
                font-size: 14px;
            }
        }
    }

    .draw-img-wrapper {
        padding: 10px 20px;

        .sku-tag {
            margin-bottom: 4px;
        }

        .draw-img-vertical-list {
            display: flex;
            flex-wrap: wrap;
            
            
        }

        .draw-img-item {
            position: relative;
            width: 200px;
            margin: 0 30px 15px 0;

            &.selected {
                border: 1px solid;
            }

            .draw-input {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                opacity: .5;

                input {
                    border-radius: 0;
                }
            }
            
        }
    }

    .el-drawer__body {
        overflow-y: auto;
    }

    .btns {
        padding: 0 20px 20px 20px;
        text-align: right;
    }
}
</style>
