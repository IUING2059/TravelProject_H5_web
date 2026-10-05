<template>
  <div class="budget-table">
    <div class="table-row table-header">
      <div class="table-cell">项目</div>
      <div class="table-cell">金额(元)</div>
    </div>
    <div class="table-row" v-for="item in data" :key="item.name">
      <div class="table-cell">{{ item.name }}</div>
      <div class="table-cell">{{ item.amount }}</div>
    </div>
    <div class="table-row total-row">
      <div class="table-cell">合计</div>
      <div class="table-cell total-text">{{ total }}</div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  data: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});
</script>
<style scoped>
.budget-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}
.table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}
.table-row:last-child {
  border-bottom: none;
}
.table-header {
  background-color: #f7f8fa;
}
.table-cell {
  flex: 1;
  padding: 12px 8px;
  font-size: 14px;
  color: #333;
}
.total-row {
  background: #fffbf5;
}
.total-text {
  font-weight: 600;
  color: #f5222d;
  font-size: 15px;
}
</style>
