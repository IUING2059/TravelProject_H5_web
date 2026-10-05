<template>
  <div class="app-wrap">
    <router-view></router-view>
    <van-tabbar
      v-if="['Home', 'Chat', 'Profile'].includes(route.name)"
      v-model="active"
    >
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/chat" icon="chat-o">对话</van-tabbar-item>
      <!-- <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item> -->
    </van-tabbar>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const active = ref(0);
// 根据当前路由path，设置tab激活下标
function updateActiveTab() {
  const path = route.path;
  if (path === "/") {
    active.value = 0;
  } else if (path === "/chat") {
    active.value = 1;
  } else if (path === "/profile") {
    active.value = 2;
  }
}
// 初始化执行一次
updateActiveTab();
// 监听路由变化，自动更新tab高亮
watch(
  () => route.path,
  () => {
    updateActiveTab();
  },
);
</script>
<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
.app-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
}
/* router-view占据剩下全部高度 */
.app-wrap > :first-child {
  flex: 1;
  overflow: hidden;
}
</style>
