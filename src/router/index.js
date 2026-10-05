import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Chat from "../views/Chat.vue";
import Profile from "../views/Profile.vue";
import Detail from "../views/Detail.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home, // 首页，进入网页默认加载
  },
  {
    path: "/chat",
    name: "Chat",
    component: Chat,
  },
  {
    path: "/profile", // 动态路由示例
    name: "Profile",
    component: Profile,
  },
  {
    path: "/detail",
    name: "Detail",
    component: Detail,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
