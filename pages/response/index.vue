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
      class="bg-gray-200 rounded-lg shadow-md h-[600px] w-auto mb-4 overflow-hidden flex flex-col"
    >
      <h2 class="text-center text-2xl font-bold mt-4">{{ displayTitle }}</h2>
      <div v-if="isLoading" class="flex-grow flex flex-col items-center justify-center">
        <!-- Logo 部分 -->
        <img
          src="~/public/temp_logo.png"
          alt="Logo"
          class="w-36 h-36 opacity-80 animate-pulse">

        <!-- 文字部分 -->
        <div class="text-gray-600 text-xl font-semibold animate-pulse mt-8">
          題目解析中...
        </div>
      </div>
      <div v-else class="flex-grow p-4 overflow-y-auto">
        <div class="mb-4">
          <p class="mb-2">{{ typingContent }}</p>
        </div>
        
        <!-- 答案部分 (只在顯示完整內容時顯示) -->
        <div v-if="showAnswer" class="text-red-600 font-bold mt-4 flex justify-end animate-fadeIn">
          {{ answer }}
        </div>
        
        <!-- 底部問助教區域 -->
        <div v-if="showFooter" class="mt-6 p-3 bg-gray-300 rounded-lg flex justify-between items-center">
          <span class="text-gray-600">分析不清楚? 快來詢問助教...</span>
          <div class="bg-gray-800 p-2 rounded-full">
            <svg viewBox="0 0 24 24" class="w-6 h-6 text-white" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { definePageMeta } from "#imports";

definePageMeta({
  pageTransition: {
    name: "page-fade",
    mode: "out-in",
  },
});

// 使用route來獲取查詢參數
const route = useRoute();
const displayTitle = ref("題目解析"); // 設置默認值
const questionId = ref(0);
const isLoading = ref(true);
const typingContent = ref("");
const showAnswer = ref(false);
const showFooter = ref(false);

const analysisContent = `根據題文所述，私人支持的遠征隊能達成目標的原因如下：

1. 主事者可自行選拔成員 → 對應選項 C（主事者權限較大） 和 D（成員較專業）
   （原文提到私人隊「可主導成員的挑選，每個人都有擅長的領域」）

2. 不受政治考量限制 → 對應選項 A（政治考量較少）
   （國家隊「受制於政治考量」，私人隊則無此限制）

3. 輕裝簡從的作風
   （國家隊「攜帶大批補給裝備」，私人隊則相反，但題目未直接接將「補給少」列為優勢，而是強調效率）

不包含的原因是選項 B（補給裝備較多）
國家隊才需要攜帶大量補給，私人隊反而因輕裝簡從而更靈活。因此，「補給裝備較多」並非私人隊成功的因素，反而是國家隊的特點。`;

const answer = "答案：(B) 補給裝備較多";

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
    console.log("Question ID:", questionId.value);
  }

  console.log("Route query:", route.query);
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
