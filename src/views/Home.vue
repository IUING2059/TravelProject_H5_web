<template>
  <div class="page-container">
    <van-nav-bar title="智能旅游助手" />
    <div class="page-content">
      <van-notice-bar
        left-icon="volume-o"
        text="基于AI的智能体验，提供个性化的旅游建议和行程规划。"
      />
    </div>
    <div class="card">
      <div class="card-header">介绍你的旅程</div>
      <van-field
        @click="showCityPicker = true"
        v-model="formData.city"
        is-link
        readonly
        label="目的地"
        placeholder="请输入城市名称"
        style="
          background-color: #f7f7f7;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 8px;
        "
      />
      <van-field
        v-model="formData.budget"
        label="预算(元)"
        placeholder="请输入预算金额"
        style="
          background-color: #f7f7f7;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 8px;
        "
      />
      <van-field
        v-model="formData.days"
        label="天数"
        placeholder="请输入旅行天数"
        style="
          background-color: #f7f7f7;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 8px;
        "
      />
      <van-button type="primary" size="large" round @click="handleSubmit">
        开始查询
      </van-button>
    </div>
    <div class="card">
      <div class="card-header">快捷入口</div>
      <van-grid class="quick-session" :column-num="2" :gutter="16">
        <van-grid-item
          icon="chat-o"
          text="AI对话"
          @click="goChat"
          class="quick-bg"
        />
        <!-- <van-grid-item
          icon="user-o"
          text="我的"
          @click="goProfile"
          class="quick-bg"
        /> -->
      </van-grid>
    </div>

    <div class="card">
      <div class="card-header">热门目的地</div>

      <van-grid :column-num="4" :gutter="12">
        <van-grid-item
          @click="selectCity(city)"
          v-for="city in hotCities"
          :key="city"
        >
          <div class="city-tag">
            {{ city }}
          </div>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
  <van-popup round position="bottom" v-model:show="showCityPicker">
    <van-picker
      title="标题"
      :columns="columns"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </van-popup>
</template>
<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const router = useRouter();

// 表单数据
const formData = reactive({
  city: "",
  budget: null,
  days: null,
});
// 是否展示城市选择器
const showCityPicker = ref(false);
//定义城市选择器的确定
const onConfirm = ({ selectedOptions }) => {
  console.log(selectedOptions[0].value);
  formData.city = selectedOptions[0].value;
  showCityPicker.value = false;
};
//定义城市选择器的取消
const onCancel = () => {
  showCityPicker.value = false;
};
//定义城市选择器的列数据
const allCities = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "成都",
  "杭州",
  "西安",
  "重庆",
  "南京",
  "武汉",
  "苏州",
  "长沙",
  "天津",
  "郑州",
  "济南",
  "青岛",
  "大连",
  "沈阳",
  "哈尔滨",
  "长春",
  "福州",
  "厦门",
  "南昌",
  "合肥",
  "昆明",
  "贵阳",
  "南宁",
  "桂林",
  "海口",
  "三亚",
  "丽江",
  "大理",
  "西安",
  "兰州",
  "乌鲁木齐",
  "拉萨",
  "呼和浩特",
  "太原",
  "石家庄",
];
// 把城市数组转成 {text,value} 格式，给Vant的城市选择器使用
const columns = allCities.map((city) => ({ text: city, value: city }));
// 提交表单
const handleSubmit = () => {
  console.log("提交表单数据:", formData);
  //表单提交逻辑
  //校验
  if (!formData.city) {
    showToast("请选择城市");
    return;
  }
  if (!formData.budget || formData.budget <= 100) {
    showToast("预算必须大于100元");
    return;
  }
  if (!formData.days || formData.days < 1 || formData.days > 30) {
    showToast("请输入1-30之间的天数");
    return;
  }
  router.push({
    path: "/detail",
    query: {
      city: formData.city,
      budget: formData.budget,
      days: formData.days,
    },
  });
};

// ========= 新增跳转方法 =========
const goChat = () => {
  // 通知父组件 / 全局状态，tabbar选中第2项（对话）
  router.push("/chat");
};
const goProfile = () => {
  // 通知父组件 / 全局状态，tabbar选中第3项（我的）
  router.push("/profile");
};

//定义热门城市数据
const hotCities = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "成都",
  "杭州",
  "西安",
  "重庆",
];

//定义热门城市选择方法
const selectCity = (city) => {
  formData.city = city;
  showCityPicker.value = false;
};
</script>
<style scoped>
.page-content {
  padding: 16px;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.card-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #323233;
}
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 70px; /* 为底部导航栏留出空间 */
}

.city-tag {
  padding: 8px 4px;
  background: #eef0f3;
  border: 1px solid #e2e4e8;
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  color: #323233;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.2s;
}
.city-tag:active {
  background: #1989fa;
  color: #fff;
  border-color: #1989fa;
}
:deep(.quick-bg) {
  background-color: #eef0f3;
  border-radius: 12px;
}
</style>
