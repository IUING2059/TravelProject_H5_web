<template>
  <div class="page-container chat-page">
    <van-nav-bar
      title="AI旅游助手"
      left-arrow
      left-text="返回"
      @click-left="onBack"
      fixed
      placeholder
    ></van-nav-bar>

    <div class="chat-container" ref="chatContainer">
      <!-- 还没有开始对话时默认展示画面 -->
      <div v-if="message.length === 0" class="chat-empty">
        <van-empty description="开始AI旅游通话"></van-empty>
        <div class="quick-questions">
          <div class="quick-title">常见问题</div>
          <div class="quick-tags-wrap">
            <van-tag
              class="quick-tag"
              v-for="question in quickQuestions"
              :key="question"
              mark
              size="large"
              @click="handleQuickClick(question)"
              >{{ question }}</van-tag
            >
          </div>
        </div>
      </div>

      <!-- 对话内容 -->
      <div class="message-list" v-else>
        <ChatBubble v-for="msg in message" :key="msg.id" :message="msg" />
        <div v-if="isStreaming" class="streaming-indicator">
          <van-loading type="spinner" size="20px" />
          <span>AI正在思考...</span>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <van-field
        v-model="inputMessager"
        placeholder="输入您的问题..."
        :disabled="isStreaming"
        @keyup.enter="sendMessage"
      >
        <template #button>
          <van-button
            :disabled="!inputMessager.trim() || isStreaming"
            @click="sendMessage"
            size="small"
            type="primary"
            >发送</van-button
          >
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, nextTick } from "vue";
// ⚠️ 请确认你 utils/request.js 里真的有导出 fetchStream
import { fetchStream } from "../utils/request";
import { showToast } from "vant";
import ChatBubble from "../components/ChatBubble.vue";

const CHAT_API_URL = "chat";

const router = useRouter();

// 聊天容器（用于自动滚动）
const chatContainer = ref(null);

// 是否正在流式接收
const isStreaming = ref(false);

// 输入框内容
const inputMessager = ref("");

// 对话列表
const message = ref([]);

// 常见问题
const quickQuestions = ref([
  "北京有哪些必去的景点",
  "上海美食推荐",
  "成都三日游攻略",
  "如何选择旅行保险",
]);

/* -------------------- 工具函数 -------------------- */

// 滚动到底部（等 DOM 更新后再滚，避免新内容还没渲染）
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    console.log(
      "[scrollToBottom] scrollTop =",
      chatContainer.value.scrollTop,
      " scrollHeight =",
      chatContainer.value.scrollHeight,
    );
  } else {
    console.warn("[scrollToBottom] chatContainer.value 为空");
  }
};

/* -------------------- 用户操作 -------------------- */

// 返回上一页
const onBack = () => {
  console.log("[onBack] 点击返回");
  router.back();
};

// 点击快捷问题
const handleQuickClick = (text) => {
  console.log("[handleQuickClick] 点击快捷问题 =", text);
  inputMessager.value = text;
};

// 发送消息
const sendMessage = () => {
  const msg = inputMessager.value.trim();
  console.log("========== 【sendMessage】 ==========");
  console.log("① 输入内容 =", JSON.stringify(msg));
  console.log("② isStreaming =", isStreaming.value);

  if (!msg || isStreaming.value) {
    console.warn("③ 被拦截：内容为空 或 正在流式中");
    return;
  }

  // 1. 加入用户消息
  addUserMessage(msg);
  console.log(
    "④ 已加入用户消息，当前 message =",
    JSON.parse(JSON.stringify(message.value)),
  );

  // 2. 清空输入框
  inputMessager.value = "";

  // 3. 发起 AI 请求
  fetchAIResponse(msg);
};

// 加入用户消息
const addUserMessage = (msg) => {
  const id = Date.now() + 1;
  message.value.push({
    id,
    role: "user",
    content: msg,
    timestamp: new Date().toISOString(),
  });
  console.log("[addUserMessage] 新增用户消息 id =", id);
  scrollToBottom();
};

/* -------------------- 核心：AI 流式请求 -------------------- */

const fetchAIResponse = async (userMsg) => {
  console.log("========== 【fetchAIResponse 开始】 ==========");
  console.log("① 用户消息 userMsg =", userMsg);

  // 标记开始流式
  isStreaming.value = true;

  // 插入 AI 占位消息
  const aiMsgId = Date.now() + 2;
  message.value.push({
    id: aiMsgId,
    role: "ai",
    content: "",
    timestamp: new Date().toISOString(),
  });

  // ✅ 关键：拿到 push 后数组里的【响应式代理对象】，
  //    直接改它才会触发视图更新
  const aiMsg = message.value[message.value.length - 1];
  console.log("② 已插入 AI 占位消息，aiMsg =", aiMsg);
  console.log("③ 当前 message =", JSON.parse(JSON.stringify(message.value)));

  let fullResponse = "";
  let chunkCount = 0;

  try {
    console.log("④ 准备调用 fetchStream：", CHAT_API_URL);

    /* ---------------------------------------------------------
     * ⚠️⚠️ 请按你 utils/request.js 里 fetchStream 的【真实签名】改：
     *
     * 常见两种形式：
     *   A. fetchStream(url, params, onChunk, onDone, onError)
     *   B. fetchStream(url, params, { onChunk, onDone, onError })
     *
     * 下面按【A】写。如果是 B，请改成对象形式。
     * --------------------------------------------------------- */
    await fetchStream(
      CHAT_API_URL,
      { message: userMsg },
      // ---- 收到一片流式数据 ----
      (chunk) => {
        chunkCount++;
        console.log(`⑤ onChunk #${chunkCount}，原始片段 =`, chunk);

        // 有些后端返回 { content: "xxx" }，有些直接返回字符串
        // 这里做兼容
        const piece =
          typeof chunk === "string" ? chunk : (chunk?.content ?? "");
        fullResponse += piece;

        // ✅ 改的是响应式代理对象
        aiMsg.content = fullResponse;

        console.log("   累计 fullResponse =", fullResponse);
        console.log("   当前 aiMsg.content =", aiMsg.content);

        scrollToBottom();
      },
      // ---- 流结束 ----
      () => {
        console.log("⑥ onDone！完整回复 =", fullResponse);
        console.log("   共收到片段数 =", chunkCount);
        isStreaming.value = false;
        console.log("   isStreaming 已置为 =", isStreaming.value);
        scrollToBottom();
      },
      // ---- 出错 ----
      (err) => {
        console.error("❌ onError 回调收到错误 =", err);
        console.error("   err.message =", err?.message);
        isStreaming.value = false;
        if (!aiMsg.content) {
          aiMsg.content = "抱歉，请求出错了，请重试。";
        }
        showToast("AI 请求失败，请重试");
      },
    );

    console.log("⑦ fetchStream 调用完毕");
  } catch (err) {
    console.error("❌ fetchStream 抛出异常 =", err);
    console.error("   err.name =", err?.name, " message =", err?.message);
    console.error("   stack =", err?.stack);
    isStreaming.value = false;
    if (!aiMsg.content) {
      aiMsg.content = "抱歉，请求出错了，请重试。";
    }
    showToast("AI 请求失败，请重试");
  } finally {
    // 兜底：如果流结束时没走 onDone，这里也保证置回 false
    if (isStreaming.value) {
      console.warn("⑧ finally 中检测到 isStreaming 仍为 true，强制置回 false");
      isStreaming.value = false;
    }
    console.log("⑨ finally：isStreaming =", isStreaming.value);
    console.log("   最终 message =", JSON.parse(JSON.stringify(message.value)));
    console.log("========== 【fetchAIResponse 结束】 ==========");
  }
};
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
  overflow: hidden;
  padding-bottom: 50px;
}
.chat-container {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}
.chat-empty {
  padding-top: 60px;
}
.quick-questions {
  margin-top: 36px;
  text-align: center;
}
.quick-title {
  font-size: 22px;
  color: #1d2129;
  margin-bottom: 24px;
  font-weight: 600;
}
.quick-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}
.quick-tag {
  font-size: 16px;
  cursor: pointer;
  background: #e8e9eb !important;
  color: #333 !important;
  border-radius: 8px !important;
}
/* 移动端点击反馈 */
.quick-tag:active {
  opacity: 0.8;
  transform: scale(0.97);
  transition: all 0.15s ease;
}
.chat-input-area {
  padding: 12px 16px;
  background-color: #ffffff;
  border-top: 1px solid #e5e6eb;
}
.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #969799;
  font-size: 14px;
  padding: 8px 4px;
}
</style>
