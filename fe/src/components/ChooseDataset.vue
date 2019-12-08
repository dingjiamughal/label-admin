<template>
    <div class="dataset-view">
        <span class="label-text">{{title}}</span>
        <el-select class="dataset-select" v-model="value" placeholder="请选择" size="small">
            <el-option
                v-for="item in lists"
                :key="item._id"
                :label="item.name"
                :value="item._id"
                size="small"
            ></el-option>
        </el-select>
        <el-button type="primary" size="small" @click="start">确认</el-button>
    </div>
</template>

<script>
export default {
    props: {
        title: {type: String, default: '选择数据集'},
        lists: {type: Array, default: () => []}
    },
    data() {
        return {
            value: ''
        };
    },
    methods: {
        start() {
            this.$emit('start', this.value);
        }
    }
};
</script>

<style lang="less" scoped>
.dataset-select {
    margin: 0 8px;
}
</style>
