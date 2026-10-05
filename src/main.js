import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import {
  Tabbar,
  TabbarItem,
  NavBar,
  NoticeBar,
  Field,
  Popup,
  Picker,
  Button,
  Grid,
  GridItem,
  ConfigProvider,
  Loading,
  Empty,
  Collapse,
  CollapseItem,
  CellGroup,
  Tag,
} from "vant";
import "vant/lib/index.css";

const app = createApp(App);
app.use(router);
app.use(Tabbar);
app.use(NavBar);
app.use(TabbarItem);
app.use(NoticeBar);
app.use(Field);
app.use(Popup);
app.use(Picker);
app.use(Button);
app.use(Grid);
app.use(GridItem);
app.use(Loading);
app.use(Empty);
app.use(ConfigProvider);
app.use(Collapse);
app.use(CollapseItem);
app.use(CellGroup);
app.use(Tag);

app.mount("#app");
