<template>
  <!-- 导航栏，标题文字灰色 -->
  <van-nav-bar
    title="推荐结果"
    left-text="返回"
    left-arrow
    @click-left="onClickLeft"
    style="background-color: #fff"
  />
  <!-- 推荐内容区域 -->
  <div class="page-container">
    <!-- 加载中样式优化 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-box">
        <van-loading size="48px" type="spinner" />
        <p class="loading-text">正在生成行程推荐...</p>
      </div>
    </div>
    <div v-else-if="error" class="error-container">
      <van-empty description="获取推荐失败">
        <van-button round type="primary" @click="fetchRecommendation"
          >重试</van-button
        >
      </van-empty>
    </div>
    <template v-else-if="tripData">
      <div class="card overview-card">
        <div class="trip-header">
          <h2>{{ tripData.city }} · {{ tripData.days }}天行程</h2>
          <div class="trip-budget">预算：{{ tripData.totalBudget }}元</div>
        </div>
      </div>
      <van-collapse v-model="activeNames">
        <van-collapse-item
          v-for="day in tripData.dailyItinerary"
          :key="day.day"
          :title="`第${day.day}天`"
          :name="day.day"
        >
          <div class="day-schedule">
            <div class="schedule-section">
              <div class="section-label morning">上午</div>
              <SpotItem :data="day.morning"></SpotItem>
            </div>
            <div class="schedule-section">
              <div class="section-label afternoon">下午</div>
              <SpotItem :data="day.afternoon"></SpotItem>
            </div>
            <div class="schedule-section">
              <div class="section-label evening">晚上</div>
              <SpotItem :data="day.evening"></SpotItem>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
      <div class="card budget-card">
        <div class="budget-header">预算明细</div>
        <BudgetTable
          :data="tripData.budgetList"
          :total="tripData.totalBudget"
        ></BudgetTable>
      </div>
      <div class="card tips-card">
        <div class="tips-header">温馨提示</div>
        <ul class="tips-list">
          <li v-for="tip in tripData.tips" :key="tip">
            {{ tip }}
          </li>
        </ul>
      </div>
      <div class="card warning-card">
        <div class="warning-header">注意事项</div>
        <ul class="warning-list">
          <li v-for="item in tripData.warnings" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </template>
  </div>
  <!-- 底部按钮 -->
  <div v-if="tripData" class="detail-footer">
    <van-button
      @click="goToChat"
      type="primary"
      class="primary-button"
      size="large"
      round
      >咨询AI助手</van-button
    >
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchJson } from "../utils/request.js"; // ✅ 改用 fetchJson
import SpotItem from "../components/SpotItem.vue";
import BudgetTable from "../components/BudgetTable.vue";

const loading = ref(false);
const error = ref(false);
const activeNames = ref([]);
const route = useRoute();
const router = useRouter();

const formData = reactive({
  city: "",
  budget: "",
  days: "",
});

const tripData = ref(null);

onMounted(() => {
  console.log("【生命周期】Detail 组件已挂载");
  console.log(
    "【路由参数】city:",
    route.query.city,
    "budget:",
    route.query.budget,
    "days:",
    route.query.days,
  );
  formData.city = route.query.city;
  formData.budget = route.query.budget;
  formData.days = route.query.days;
  fetchRecommendation();
});

const onClickLeft = () => router.go(-1);

const normalizeTripData = (data) => {
  const budgetBreakdown = data?.budgetBreakdown || {};
  data.budgetList = [
    { name: "住宿费", amount: budgetBreakdown.accommodation ?? 0 },
    { name: "餐饮", amount: budgetBreakdown.food ?? 0 },
    { name: "交通费", amount: budgetBreakdown.transportation ?? 0 },
    { name: "门票", amount: budgetBreakdown.tickets ?? 0 },
    { name: "其他", amount: budgetBreakdown.other ?? 0 },
  ];
  return data;
};

const applyTripData = (data) => {
  console.log("【数据应用】应用数据:", data);
  tripData.value = normalizeTripData(data);
  activeNames.value = (tripData.value?.dailyItinerary || []).map((d) => d.day);
  console.log("【数据应用】tripData.value 已更新:", tripData.value);
};

/**
 * 万能解析：兼容
 *   1. 后端包装器 { code, data, message }
 *   2. OpenAI 格式 { choices: [{ message: { content } }] }
 *   3. 纯业务 JSON（含 city 字段）
 */
const parseLLMResponse = (raw) => {
  console.log("【解析工具】原始数据类型:", typeof raw);

  let obj = raw;

  // 如果传进来是字符串，先 JSON.parse
  if (typeof obj === "string") {
    const cleanStr = obj
      .replace(/^data:\s*/gm, "")
      .replace(/\[DONE\]/g, "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      obj = JSON.parse(cleanStr);
    } catch (e) {
      console.error(
        "【解析工具】JSON.parse 失败，前500字符:",
        cleanStr.substring(0, 500),
      );
      throw e;
    }
  }

  console.log("【解析工具】首次解析结果:", obj);

  // 递归解包，最多 5 层
  for (let depth = 0; depth < 5; depth++) {
    // 1. 后端包装器：{ code, data, ... }
    if (obj && typeof obj === "object" && "data" in obj && "code" in obj) {
      console.log(`【解析工具】第${depth + 1}层：解包后端包装器 → data`);
      obj = obj.data;
      continue;
    }

    // 2. OpenAI 格式：{ choices: [...] }
    if (obj && obj.choices && obj.choices[0]) {
      const content =
        obj.choices[0].message?.content || obj.choices[0].delta?.content || "";
      console.log(
        `【解析工具】第${depth + 1}层：解包 OpenAI 格式，content 长度:`,
        content.length,
      );
      if (typeof content === "string") {
        const cleaned = content
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        try {
          obj = JSON.parse(cleaned);
          continue;
        } catch {
          throw new Error(
            "choices.content 不是有效 JSON: " + cleaned.substring(0, 200),
          );
        }
      }
      obj = content;
      continue;
    }

    // 3. 业务数据（有 city 字段）
    if (obj && obj.city) {
      console.log(`【解析工具】第${depth + 1}层：识别为业务数据`);
      return obj;
    }

    break;
  }

  throw new Error(
    "无法识别的数据结构: " + JSON.stringify(obj).substring(0, 300),
  );
};

const fetchRecommendation = async () => {
  console.log("【请求开始】准备获取推荐数据...");

  loading.value = true;
  error.value = false;
  tripData.value = null;

  const params = {
    city: route.query.city || "北京",
    budget: Number(route.query.budget) || 5000,
    days: Number(route.query.days) || 2,
  };
  console.log("【请求参数】", params);

  try {
    // ✅ 用 fetchJson 直接 await 拿到已解包的数据
    const backendData = await fetchJson("/recommend", params);
    console.log("【请求成功】后端返回数据:", backendData);

    const parsedData = parseLLMResponse(backendData);
    console.log("【解析成功】业务数据:", parsedData);
    applyTripData(parsedData);
  } catch (e) {
    console.error("【请求失败】", e);
    error.value = true;
  } finally {
    loading.value = false;
    console.log("【状态更新】loading = false, error =", error.value);
  }
};

const goToChat = () => {
  router.push({ name: "Chat" });
};
</script>

<style scoped>
.page-container {
  padding: 16px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 46px);
  box-sizing: border-box;
  padding-bottom: 100px;
}
.loading-container {
  width: 100%;
  height: calc(100vh - 46px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f7f8fa;
}
.loading-box {
  text-align: center;
}
.loading-text {
  margin: 12px 0 0;
  font-size: 14px;
  color: #666;
}
.error-container {
  min-height: calc(100vh - 46px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}
.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.trip-header h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: #222;
}
.trip-budget {
  color: #f5222d;
  font-size: 17px;
  font-weight: 600;
}
.day-schedule {
  padding: 10px 0;
}
.schedule-section {
  margin-bottom: 20px;
}
.schedule-section:last-child {
  margin-bottom: 0;
}
.section-label {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 10px;
  font-weight: 500;
}
.morning {
  background-color: #fff7cc;
  color: #d49b00;
}
.afternoon {
  background-color: #e6f4ff;
  color: #2378dd;
}
.evening {
  background-color: #e6ffe6;
  color: #389e0d;
}
.budget-header,
.tips-header,
.warning-header {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin-bottom: 14px;
}
.tips-list,
.warning-list {
  padding-left: 22px;
  margin: 0;
  color: #555;
  font-size: 14px;
  line-height: 1.8;
}
.tips-list li,
.warning-list li {
  margin-bottom: 6px;
}
.tips-list li:last-child,
.warning-list li:last-child {
  margin-bottom: 0;
}
.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  box-sizing: border-box;
  z-index: 99;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}
.primary-button {
  width: 100%;
}
</style>
