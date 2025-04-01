<template>
  <div class="flex flex-col w-full max-w-screen-lg ml-20 mt-25">
    <div class="flex items-center mb-4">
      <button
        class="flex items-center text-lg hover:text-blue-600 transition-colors"
        @click="$router.push('/select')"
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

    <h2 class="text-5xl text-center font-bold mb-2">國文</h2>
    <div
      class="bg-gray-200 rounded-lg shadow-md h-[600px] w-auto mb-4 overflow-hidden flex flex-col relative"
    >
      <!-- 顯示題目 -->
      <div class="p-4 text-center font-bold text-xl mb-2">
        {{ displayTitle }}
      </div>

      <!-- 載入中狀態 -->
      <div
        v-if="isLoading"
        class="flex-grow flex flex-col items-center justify-center"
      >
        <img
          src="~/public/temp_logo.png"
          alt="Logo"
          class="w-36 h-36 opacity-80 animate-pulse"
        />
        <div class="text-gray-600 text-xl font-semibold animate-pulse mt-8">
          題目解析中...
        </div>
      </div>

      <!-- 解析內容和聊天區域 -->
      <div
        v-else
        class="flex-grow px-4 pb-16 overflow-y-auto"
        ref="contentArea"
      >
        <!-- 解析內容 -->
        <div
          class="mb-4 analysis-content"
          v-html="renderMarkdown(typingContent)"
        />

        <!-- 答案部分 -->
        <div
          v-if="showAnswer"
          class="text-right text-red-600 font-bold mt-4 mb-6 animate-fadeIn"
        >
          {{ answer }}
        </div>

        <!-- 聊天對話區域 -->
        <div
          v-if="messages.length > 0"
          class="mt-6 border-t border-gray-300 pt-4"
        >
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

      <!-- 底部問助教區域 -->
      <div 
        v-if="showFooter" 
        class="absolute bottom-0 left-0 right-0 bg-gray-300 py-3 px-4 rounded-b-lg flex justify-between items-center"
      >
        <div class="flex-grow flex items-center space-x-2">
          <!-- 語音輸入按鈕 -->
          <button
            @click="toggleVoiceInput"
            class="p-2 rounded-full transition-colors focus:outline-none"
            :class="isListening ? 'bg-red-500 text-white pulse-animation' : 'bg-gray-400 hover:bg-gray-500 text-white'"
            title="語音輸入"
          >
            <!-- 麥克風圖標 -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- 輸入框 -->
          <input 
            v-model="userQuestion"
            type="text" 
            placeholder="分析不清楚? 快來詢問助教..." 
            class="w-full py-2 px-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="sendQuestion"
          >
        </div>
        
        <!-- 發送按鈕 -->
        <button 
          class="bg-gray-800 p-2 rounded-full ml-3 hover:bg-gray-700 transition-colors"
          @click="sendQuestion"
        >
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-white" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- 語音識別狀態提示 -->
      <div 
        v-if="isListening && showFooter" 
        class="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-full shadow-md flex items-center"
      >
        <span class="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
        正在聆聽...
      </div>
      
      <!-- 語音識別錯誤提示 -->
      <div 
        v-if="speechError && showFooter" 
        class="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full shadow-md"
      >
        {{ speechError }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { definePageMeta } from "#imports";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useSpeechToText } from '~/composables/useSpeechToText';

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
  stopListening 
} = useSpeechToText();


// 使用route來獲取查詢參數
const route = useRoute();
const displayTitle = ref(
  "「111111由國家出資的遠征計畫，經費較高，卻少有重大發現。官方......」"
);
const questionId = ref(0);
const isLoading = ref(true);
const typingContent = ref("");
const showAnswer = ref(false);
const showFooter = ref(false);
const contentArea = ref(null);

// 聊天相關
const userQuestion = ref("");
const messages = ref([]);
const isMessageSending = ref(false);

watch(speechText, (newText) => {
  if (newText) {
    userQuestion.value = newText;
  }
});

// 監聽消息變化，自動滾動到底部
watch(
  messages,
  () => {
    nextTick(scrollToBottom);
  },
  { deep: true }
);

// 監聽打字內容變化，自動滾動
watch(typingContent, () => {
  nextTick(scrollToBottom);
});

// 切換語音輸入
const toggleVoiceInput = () => {
  if (!isSupportedAPI.value) {
    alert('您的瀏覽器不支援語音識別功能');
    return;
  }
  
  if (isListening.value) {
    stopListening();
  } else {
    startListening('zh-TW');
  }
};

// AI回答範本
const aiResponses = [
  "根據題目內容，私人遠征隊之所以成功是因為他們更靈活，不受政治因素限制。",
  "這道題重點在於比較國家隊與私人隊的差異，國家隊比較注重補給裝備，但效率較低。",
  "選項B「補給裝備較多」是國家隊的特點，而不是私人隊成功的原因，所以是正確答案。",
  "文中提到私人隊採取「輕裝簡從」的作風，與選項B相反，因此選項B是不包含的因素。",
  "題目指出私人隊能夠自行選拔成員，這對應到選項C和D，所以這兩項是包含的原因。",
];

// Markdown 格式的解析內容
const analysisContent = `根據題文所述，私人支持的遠征隊能達成目標的原因如下：

1. **主事者可自行選拔成員** → 對應選項 C（主事者權限較大） 和 D（成員較專業）
   （原文提到私人隊「可主導成員的挑選，每個人都有擅長的領域」）

2. **不受政治考量限制** → 對應選項 A（政治考量較少）
   （國家隊「受制於政治考量」，私人隊則無此限制）

3. **輕裝簡從的作風**
   （國家隊「攜帶大批補給裝備」，私人隊則相反，但題目未直接接將「補給少」列為優勢，而是強調效率）

不包含的原因是選項 B（補給裝備較多）
國家隊才需要攜帶大量補給，私人隊反而因輕裝簡從而更靈活。因此，「補給裝備較多」並非私人隊成功的因素，反而是國家隊的特點。`;

const answer = "答案：(B) 補給裝備較多";

// 將 Markdown 轉換為 HTML
const renderMarkdown = (content) => {
  if (!content) return "";
  // 使用 marked 解析 Markdown
  const rawHtml = marked(content);
  // 使用 DOMPurify 清理 HTML
  return DOMPurify.sanitize(rawHtml);
};

// 發送問題
const sendQuestion = async () => {
  if (!userQuestion.value.trim() || isMessageSending.value) return;

  isMessageSending.value = true;

  // 添加用戶消息
  messages.value.push({
    type: "user",
    content: userQuestion.value,
  });

  // 清空輸入框
  userQuestion.value = "";

  // 滾動到底部 (使用 await 確保 DOM 更新後滾動)
  await nextTick();
  scrollToBottom();

  // 添加AI正在輸入的消息
  messages.value.push({
    type: "ai",
    content: "",
    loading: true,
  });

  // 模擬AI思考時間 (1-2秒)
  const thinkingTime = 1000 + Math.random() * 1000;
  setTimeout(() => {
    // 隨機選擇一個回答
    const randomResponse =
      aiResponses[Math.floor(Math.random() * aiResponses.length)];

    // 更新最後一條消息
    messages.value[messages.value.length - 1] = {
      type: "ai",
      content: randomResponse,
      loading: false,
    };

    // 啟用輸入框
    isMessageSending.value = false;

    // 滾動到底部 (確保顯示完整消息後再滾動)
    nextTick(() => {
      setTimeout(scrollToBottom, 100); // 添加小延遲確保渲染完成
    });
  }, thinkingTime);
};

// 滾動到底部 (使用平滑滾動)
const scrollToBottom = () => {
  if (contentArea.value) {
    contentArea.value.scrollTo({
      top: contentArea.value.scrollHeight,
      behavior: "smooth",
    });
  }
};

// 模擬打字機效果
const typeWriterEffect = async (text, speed = 30) => {
  let i = 0;
  typingContent.value = "";

  const typeNextChar = () => {
    if (i < text.length) {
      typingContent.value += text.charAt(i);
      i++;
      setTimeout(typeNextChar, speed);
    } else {
      // 內容輸出完畢後顯示答案
      setTimeout(() => {
        showAnswer.value = true;

        // 答案顯示後再顯示底部詢問區
        setTimeout(() => {
          showFooter.value = true;
        }, 500);
      }, 500);
    }
  };

  typeNextChar();
};

onMounted(() => {
  // 從URL查詢參數獲取標題和ID
  if (route.query.title) {
    displayTitle.value = decodeURIComponent(route.query.title);
  }

  if (route.query.id) {
    questionId.value = parseInt(route.query.id);
  }

  // 5秒後顯示內容
  setTimeout(() => {
    isLoading.value = false;
    nextTick(() => {
      // 開始打字機效果
      typeWriterEffect(analysisContent);
    });
  }, 5000);
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
</style>
