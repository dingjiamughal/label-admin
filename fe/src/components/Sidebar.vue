<template>
    <el-row class="sidebar">
        <el-col class="sidebar-inner">
            <el-menu 
                :default-active="activeMenuItem"
                :router="true"
                class="menu-content"
            >
                <el-menu-item index="upload">
                    <span slot="title">流水线</span>
                </el-menu-item>
                <el-menu-item index="dataset">
                    <span slot="title">查看数据集</span>
                </el-menu-item>
                <el-submenu index="">
                    <template slot="title">
                        <span>操作</span>
                    </template>
                    <el-menu-item-group>
                        <el-menu-item index="check">审核</el-menu-item>
                        <el-menu-item index="angle">旋转角修正</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>
                
            </el-menu>
        </el-col>
    </el-row>
</template>

<script>
export default {
    computed: {
        activeMenuItem() {
            return this.$route.name;
        }
    }
};
</script>

<style lang="less" scoped>
.sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    // overflow-y: auto;

    .sidebar-inner,
    .menu-content {
        width: 239px;
        height: 100%;
    }
}
</style>