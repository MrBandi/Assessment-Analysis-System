<template>
  <div class="flex flex-col w-full max-w-screen-lg ml-20 mt-25">
    <div class="flex items-center mb-4">
      <button
        class="flex items-center text-lg hover:text-blue-600 transition-colors"
        @click="$router.push('/')"
      >
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 mr-2"
        >
          <path
            d="M30,29a1,1,0,0,1-.81-.41l-2.12-2.92A18.66,18.66,0,0,0,15,18.25V22a1,1,0,0,1-1.6.8l-12-9a1,1,0,0,1,0-1.6l12-9A1,1,0,0,1,15,4V8.24A19,19,0,0,1,31,27v1a1,1,0,0,1-.69.95A1.12,1.12,0,0,1,30,29ZM14,16.11h.1A20.68,20.68,0,0,1,28.69,24.5l.16.21a17,17,0,0,0-15-14.6,1,1,0,0,1-.89-1V6L3.67,13,13,20V17.11a1,1,0,0,1,.33-.74A1,1,0,0,1,14,16.11Z"
          />
        </svg>
        返回上一頁
      </button>
    </div>
    <div
      class="bg-gray-200 rounded-lg shadow-md h-[600px] w-auto mb-4 overflow-hidden flex flex-col relative"
    >
      <div class="flex-grow px-4 pb-16 overflow-y-auto" ref="contentArea">
        <!-- 解析內容 -->
        <div
          class="mb-4 analysis-content"
          v-html="renderMarkdown(typingContent)"
        />
        <!-- 聊天對話區域 -->
        <div v-if="messages.length > 0" class="mt-4 pt-4">
          <div v-for="(message, index) in messages" :key="index" class="mb-4">
            <!-- 用戶消息 -->
            <div v-if="message.type === 'user'" class="flex justify-end">
              <div
                class="bg-blue-100 rounded-lg p-3 max-w-[80%] border border-blue-200 shadow-sm"
              >
                {{ message.content }}
              </div>
            </div>

            <!-- AI消息 -->
            <div v-else class="flex">
              <!-- AI頭像或載入動畫 -->
              <div
                v-if="message.loading"
                class="w-8 h-8 flex items-center justify-center mr-2"
              >
                <div class="dot-pulse" />
              </div>
              <div v-else class="w-8 h-8 flex items-center justify-center mr-2">
                <img src="~/public/temp_logo.png" alt="AI" class="w-6 h-6" />
              </div>

              <!-- AI消息內容 -->
              <div
                class="bg-gray-100 rounded-lg p-3 max-w-[80%] border border-gray-300 shadow-sm"
              >
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部問助教區域的完整結構 -->
      <div class="absolute bottom-0 left-0 right-0 flex flex-col w-full">
        <!-- 導航風格的快速問題按鈕 - 直接放在輸入框上方 -->
        <div
          class="text-black px-2 py-2 flex items-center justify-around w-full border-b border-gray-300"
        >
          <button
            v-for="(question, index) in quickQuestions"
            :key="index"
            @click="useQuickQuestion(question)"
            class="flex items-center px-3 py-1 rounded hover:bg-gray-300 transition-colors"
          >
            <!-- 為每個問題添加圖標 -->
            <svg
              v-if="index === 0"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-if="index === 1"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
              />
            </svg>
            <svg
              v-if="index === 2"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm">{{ question }}</span>
          </button>
        </div>

        <!-- 輸入框區域 -->
        <div
          class="bg-gray-300 py-3 px-4 rounded-b-lg flex justify-between items-center"
        >
          <div class="flex-grow flex items-center space-x-2">
            <!-- 語音輸入按鈕 -->
            <button
              :class="
                isListening
                  ? 'bg-red-500 text-white pulse-animation'
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              "
              title="語音輸入"
              class="p-2 rounded-full transition-colors focus:outline-none"
              @click="toggleVoiceInput"
            >
              <!-- 麥克風圖標 -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- 輸入框 -->
            <input
              v-model="userQuestion"
              type="text"
              placeholder="想詢問助教甚麼問題呢？"
              class="w-full py-2 px-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="sendQuestion"
            />
          </div>

          <!-- 發送按鈕 -->
          <button
            class="bg-gray-800 p-2 rounded-full ml-3 hover:bg-gray-700 transition-colors"
            @click="sendQuestion"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 語音識別狀態提示 -->
      <div
        v-if="isListening"
        class="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-full shadow-md flex items-center"
      >
        <span class="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse" />
        正在聆聽...
      </div>

      <!-- 語音識別錯誤提示 -->
      <div
        v-if="speechError"
        class="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full shadow-md"
      >
        {{ speechError }}
      </div>

      <!-- TTS错误提示
      <div
        v-if="ttsError && showFooter"
        class="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full shadow-md"
      >
        {{ ttsError }}
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useSpeechToText } from "~/composables/useSpeechToText";

definePageMeta({
  pageTransition: {
    name: "page-fade",
    mode: "out-in",
  },
});

// 語音轉文字功能
const {
  text: speechText,
  isListening,
  isSupportedAPI,
  error: speechError,
  startListening,
  stopListening,
} = useSpeechToText();

const contentArea = ref(null);
const userQuestion = ref("");
const messages = ref([]);
const isMessageSending = ref(false);
const aiResponses = [
  "我們的系統是人工智慧評量分析系統，主要用於協助學生進行學習評量和分析。",
  "這個系統由一群AI系科大學生開發而成，旨在提供更好的學習體驗。",
  "這個系統的目的是幫助學生更好地理解和掌握評量不懂的地方，去做解析及理解的部分。",
];

const quickQuestions = ref([
  "這個系統的主要用處是什麼？",
  "你是由哪個團隊開發出來了？",
  "為什麼需要這個系統？",
]);

// 将 Markdown 转换为 HTML
const renderMarkdown = (content) => {
  if (!content) return "";
  // 使用 marked 解析 Markdown
  const rawHtml = marked(content);
  // 使用 DOMPurify 清理 HTML
  return DOMPurify.sanitize(rawHtml);
};
const typingContent = ref("");

// 滚动到底部
const scrollToBottom = () => {
  if (contentArea.value) {
    contentArea.value.scrollTo({
      top: contentArea.value.scrollHeight,
      behavior: "smooth",
    });
  }
};

const sendQuestion = async () => {
  if (!userQuestion.value.trim() || isMessageSending.value) return;

  isMessageSending.value = true;

  // 添加用户消息
  messages.value.push({
    type: "user",
    content: userQuestion.value,
  });

  // 清空输入框
  userQuestion.value = "";

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  // 添加AI正在输入的消息
  messages.value.push({
    type: "ai",
    content: "",
    loading: true,
  });

  // 模拟AI思考时间
  const thinkingTime = 1000 + Math.random() * 1000;
  setTimeout(async () => {
    // 随机选择一个回答
    const questionIndex = messages.value[messages.value.length - 2].content;
    let randomResponse;

    // Check if the last user message matches any of the quick questions
    const quickQuestionIndex = quickQuestions.value.indexOf(questionIndex);
    if (quickQuestionIndex !== -1 && quickQuestionIndex < aiResponses.length) {
        // If it's a quick question, use the corresponding response
        randomResponse = aiResponses[quickQuestionIndex];
    } else {
        // For other questions, use a random response
        randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }

    // 更新最后一条消息
    messages.value[messages.value.length - 1] = {
      type: "ai",
      content: randomResponse,
      loading: false,
    };

    // 启用输入框
    isMessageSending.value = false;

    // 滚动到底部
    nextTick(() => {
      setTimeout(scrollToBottom, 100);
    });
  }, thinkingTime);
};

const useQuickQuestion = (question) => {
  userQuestion.value = question;
  // Optional: automatically send the question
  sendQuestion(userQuestion.value);
};

const toggleVoiceInput = () => {
  if (!isSupportedAPI.value) {
    alert("您的瀏覽器不支援語音識別功能");
    return;
  }

  if (isListening.value) {
    stopListening();
  } else {
    startListening("zh-TW");
  }
};

watch(
  messages,
  () => {
    nextTick(scrollToBottom);
  },
  { deep: true }
);

// 监听打字内容变化，自动滚动
watch(typingContent, () => {
  nextTick(scrollToBottom);
});

watch(speechText, (newText) => {
  if (newText) {
    userQuestion.value = newText;
  }
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 1s ease-in-out;
}

/* Markdown 渲染樣式 */
:deep(.analysis-content h1) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

:deep(.analysis-content h2) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
}

:deep(.analysis-content p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

:deep(.analysis-content strong) {
  font-weight: 600;
}

:deep(.analysis-content ol, .analysis-content ul) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

:deep(.analysis-content li) {
  margin-bottom: 0.5rem;
}

/* 打字機動畫 */
.dot-pulse {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #9880ff;
  color: #9880ff;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0.25s;
}

.dot-pulse::before,
.dot-pulse::after {
  content: "";
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #9880ff;
  color: #9880ff;
}

.dot-pulse::before {
  left: -15px;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0s;
}

.dot-pulse::after {
  left: 15px;
  animation: dot-pulse 1.5s infinite linear;
  animation-delay: 0.5s;
}

@keyframes dot-pulse {
  0% {
    transform: scale(0.2);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.2);
    opacity: 0.7;
  }
}

/* 語音按鈕脈衝動畫 */
.pulse-animation {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}
</style>
