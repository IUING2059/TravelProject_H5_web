<template>
  <div
    class="bubble-wrap"
    :class="{ user: message.role === 'user', ai: message.role === 'ai' }"
  >
    <!-- 头像 -->
    <div class="avatar">
      <span v-if="message.role === 'user'">我</span>
      <span v-else>AI</span>
    </div>
    <!-- 消息内容 -->
    <div class="bubble">
      <p class="bubble-text">{{ message.content }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: Object,
    required: true,
    // 结构：{ id, role, content, timestamp }
  },
});
</script>

<style scoped>
.bubble-wrap {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}
/* 用户消息居右 */
.bubble-wrap.user {
  flex-direction: row-reverse;
}
.avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #07c160;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.bubble-wrap.ai .avatar {
  background: #1989fa;
}
.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fff;
}
.bubble-wrap.user .bubble {
  background: #95ec69;
}
.bubble-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}
</style>
