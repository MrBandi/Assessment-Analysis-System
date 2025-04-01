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
            :class="
              isListening
                ? 'bg-red-500 text-white pulse-animation'
                : 'bg-gray-400 hover:bg-gray-500 text-white'
            "
            title="語音輸入"
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
            placeholder="分析不清楚? 快來詢問助教..."
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

      <!-- TTS错误提示 -->
      <div
        v-if="ttsError && showFooter"
        class="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full shadow-md"
      >
        {{ ttsError }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { definePageMeta } from "#imports";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useSpeechToText } from "~/composables/useSpeechToText";
import { useTextToSpeech } from "~/composables/useTextToSpeech";

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

// 文字轉語音功能
const { speak, error: ttsError } = useTextToSpeech();

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

const googleTTSConfig = {
    apiKey: process.env.GOOGLE_TTS_API_KEY || "", // 可以从环境变量读取
    language: "zh-TW",
    voice: "zh-TW-Standard-A", // 也可以使用 'zh-TW-Wavenet-A' 获得更自然的声音
    gender: "FEMALE",
};

watch(speechText, (newText) => {
    if (newText) {
        userQuestion.value = newText;
    }
});

watch(ttsError, (newError) => {
    if (newError) {
        console.error('TTS錯誤:', newError);
    }
});

// 监听消息变化，自动滚动到底部
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

// 切换语音输入
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

// AI回答範本
const aiResponses = [
    "這道題重點在於比較國家隊與私人隊的差異，國家隊比較注重補給裝備，但效率較低。",
];

// Markdown 格式的解析內容
const a1 = `# 題目解析
此題考查對諺語涵義的理解。

## 關鍵分析
1. 原句強調「先想終局後行動」
2. 選項比對：
        - (B)「先看路再邁步」最符合
3. 排除選項：
        - (A)強調休息
        - (C)強調堅持
        - (D)強調輕裝

## 正確答案
【B】

## 試題延伸
此句體現「謀定而後動」的處事智慧。`;

const a2 = `# 題目解析
此題考查對文意和詩歌功能的理解。

## 關鍵分析
1. 關鍵線索：
        - 「把當下拉住」
        - 「留下年輕心情」
2. 詩歌功能：
        - 記錄時間中的情感
3. 排除選項：
        - (A)(B)(C)不符「留住時光」概念

## 正確答案
【D】

## 試題延伸
詩歌被稱為「時間的藝術」，具有凝固瞬間的功用。`;

const a8 = `# 題目解析
根據題文所述，私人支持的遠征隊能達成目標的原因如下：
    
## 關鍵分析
1. **主事者可自行選拔成員** → 對應選項 C（主事者權限較大） 和 D（成員較專業）
        （原文提到私人隊「可主導成員的挑選，每個人都有擅長的領域」）
    
2. **不受政治考量限制** → 對應選項 A（政治考量較少）
        （國家隊「受制於政治考量」，私人隊則無此限制）
    
3. **輕裝簡從的作風**
        （國家隊「攜帶大批補給裝備」，私人隊則相反，但題目未直接接將「補給少」列為優勢，而是強調效率）

## 正確答案
不包含的原因是選項 B（補給裝備較多）
國家隊才需要攜帶大量補給，私人隊反而因輕裝簡從而更靈活。因此，「補給裝備較多」並非私人隊成功的因素，反而是國家隊的特點。`;

const answer1 = "答案：(B) 先看路再邁步";
const answer2 = "答案：(D) 留住年輕的心情";
const answer8 = "答案：(B) 補給裝備較多";

// 根據 ID 選擇對應的內容
const analysisContent = computed(() => {
    switch (questionId.value) {
         case 0:
                return a1;
         case 1:
                return a2;
         case 8:
                return a8;
         default:
                return a1; // 預設顯示 a1
    }
});

// 根據 ID 選擇對應的答案
const answer = computed(() => {
    switch (questionId.value) {
         case 0:
                return answer1;
         case 1:
                return answer2;
         case 8:
                return answer8;
         default:
                return answer1; // 預設顯示 answer1
    }
});

// 将 Markdown 转换为 HTML
const renderMarkdown = (content) => {
    if (!content) return "";
    // 使用 marked 解析 Markdown
    const rawHtml = marked(content);
    // 使用 DOMPurify 清理 HTML
    return DOMPurify.sanitize(rawHtml);
};

// 发送问题
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
        const randomResponse =
            aiResponses[Math.floor(Math.random() * aiResponses.length)];

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

        // 使用 TTS 播放回答并触发 Live2D 模型说话动作
        try {
            await speak(randomResponse, googleTTSConfig);
        } catch (error) {
            console.error("TTS錯誤:", error);
        }
    }, thinkingTime);
};

// 滚动到底部
const scrollToBottom = () => {
    if (contentArea.value) {
        contentArea.value.scrollTo({
            top: contentArea.value.scrollHeight,
            behavior: "smooth",
        });
    }
};

// 模拟打字机效果
const typeWriterEffect = async (text, speed = 30) => {
    let i = 0;
    typingContent.value = "";

    const typeNextChar = () => {
        if (i < text.length) {
            typingContent.value += text.charAt(i);
            i++;
            setTimeout(typeNextChar, speed);
        } else {
            // 内容输出完毕后显示答案
            setTimeout(() => {
                showAnswer.value = true;

                // 朗读答案
                speak(answer.value, googleTTSConfig);

                // 答案显示后再显示底部询问区
                setTimeout(() => {
                    showFooter.value = true;
                }, 500);
            }, 500);
        }
    };

    typeNextChar();
};

onMounted(() => {
    // 从URL查询参数获取标题和ID
    if (route.query.title) {
        displayTitle.value = decodeURIComponent(route.query.title);
    }

    if (route.query.id) {
        questionId.value = parseInt(route.query.id);
    }

    // 5秒后显示内容
    setTimeout(() => {
        isLoading.value = false;
        nextTick(() => {
            // 开始打字机效果
            typeWriterEffect(analysisContent.value);
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
