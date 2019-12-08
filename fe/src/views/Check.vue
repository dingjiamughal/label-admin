<template>
    <div class="page-check">
        <div class="op-wrapper">
            <el-row>
                <el-col :span="12">
                    <choose-input title="选择数据集" :lists="labels" @start="start"></choose-input>
                </el-col>
            </el-row>
        </div>
        <div class="img-wrapper" v-show="src">
            <el-row>
                <el-col :span="12">
                    <el-image :src="src" @load="imgLoaded">
                        <div slot="placeholder" class="image-slot">加载中<span class="dot">...</span></div>
                    </el-image>
                </el-col>
                <el-col :span="12">
                    <el-form ref="checkForm" :model="checkForm" label-width="80px">
                        <el-form-item label="quality">
                            <el-radio-group v-model="checkForm.quality">
                                <el-radio :label="0"></el-radio>
                                <el-radio :label="1"></el-radio>
                                <el-radio :label="2"></el-radio>
                                <el-radio :label="3"></el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="angle">
                            <el-radio-group v-model="checkForm.angle">
                                <el-radio :label="0">正立</el-radio>
                                <el-radio :label="1">左转90°</el-radio>
                                <el-radio :label="2">右转90°</el-radio>
                                <el-radio :label="3">倒立180°</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSubmit(-1)" size="small" :disabled="disabled">上一张</el-button>
                            <el-button type="primary" @click="onSubmit(1)" size="small" :disabled="disabled">下一张</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import ChooseInput from '@/components/ChooseDataset';

export default {
    data() {
        return {
            src: '',
            labels: [],
            itemId: '',
            currentIndex: 1,
            datasetId: '',
            checkForm: {
                angle: null,
                quality: null
            },
            disabled: false
        };
    },
    components: {
        ChooseInput
    },
    async created() {
        const labels = await this.http.get('/label');
        this.labels = labels.data.data;
    },
    methods: {
        async getDataset() {
            const url = `/dataset/${this.datasetId}?pageSize=1&pageNum=${this.currentIndex}`;
            const data = await this.http.get(url);
            const item = data.data.data.items[0];
            this.src = item.originalUrl;
            this.itemId = item._id;
            this.checkForm = {
                angle: item.angle === 9999 ? 0 : item.angle,
                quality: item.quality === 9999 ? 0 : item.quality
            };
            this.total = item.total;
        },
        async saveDataset() {
            const url = `/dataset/${this.itemId}`;
            const {angle, quality} = this.checkForm;
            const result = await this.http.put(url, {
                angle,
                quality
            });
            return result;
        },
        start(val) {
            this.datasetId = val;
            this.getDataset();
        },
        async onSubmit(point) {
            const currentIndex = this.currentIndex;
            const nowIndex = this.currentIndex + point;
            if (nowIndex < 1 || nowIndex > this.total) {
                this.$message({
                    message: '到顶了',
                    type: 'warning',
                    duration: 600
                });
                return;
            }

            try {
                this.currentIndex = nowIndex;
                this.disabled = true;
                const res = await this.saveDataset();
                this.$message({
                    message: res.data.data,
                    type: 'success',
                    duration: 600
                });
                await this.getDataset();
            }
            catch (e) {
                this.currentIndex = currentIndex;
                console.log('load failed');
            }
        },
        imgLoaded() {
            this.disabled = false;
        }
    }
};
</script>

<style lang="less" scoped>
.page-check {
    padding: 8px 15px;

    .op-wrapper {
        margin-bottom: 10px;
    }

    .img-wrapper {
    }
}
</style>
