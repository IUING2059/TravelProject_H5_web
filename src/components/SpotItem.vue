<template>
  <div class="spot-item">
    <h3 class="spot-name">{{ data.spot }}</h3>
    <div class="spot-info">
      <span>🕒{{ data.duration }}</span>
      <!-- 用Number转成数字，防止字符串拼接问题 -->
      <span>🎫门票{{ Number(data.ticket) }}元</span>
    </div>
    <div class="spot-traffic">🚇{{ data.transportation }}</div>
    <p class="spot-desc">{{ data.description }}</p>
  </div>
</template>
<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped>
/* 样式不变，无需改动 */
.spot-item {
  padding: 8px 10px;
  background-color: #fbfcfe;
  border-radius: 10px;
  border: 1px solid #f0f4f9;
}
.spot-name {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px;
}
.spot-info {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
  display: flex;
  gap: 16px;
}
.spot-traffic {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}
.spot-desc {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin: 0;
}
</style>
