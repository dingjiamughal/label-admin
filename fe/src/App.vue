<template>
<!-- eslint-disable -->
    <div id="app">
        <header class="header">
            <router-link to="/">
                <span class="logo-name">sku管理</span>
            </router-link>
        </header>
        <sidebar/>
        <div class="page">
            <router-view />
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import Sidebar from '@/components/Sidebar';
export default {
    components: {
        Sidebar
    },
    data() {
        return {};
    },
    created() {},
    methods: {}
};
</script>

<style lang="less">
* {
    padding: 0;
    margin: 0;
}

a {
    text-decoration: none;
}

body,
html {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    width: 100%;
    height: 100%;
}

#app {
    height: 100%;
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    height: 60px;
    padding: 11px 24px;
    background-color: #fff;
    box-sizing: border-box;
    border-bottom: 1px solid #eaecef;
    line-height: 38px;

    .logo-name {
        font-size: 20px;
        font-weight: 600;
        color: #2c3e50;
    }
}

.page {
    padding: 60px 0 0 240px;
    width: calc(100% - 240px);
    height: calc(100% - 60px);
    overflow-y: auto;
}
</style>
