<template>
  <div class="flex flex-col w-full max-w-screen-lg ml-20 mt-25">
    <div class="flex items-center mb-4">
      <button 
        class="flex items-center text-lg hover:text-blue-600 transition-colors"
        @click="$router.push('/')" 
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2">
          <path d="M30,29a1,1,0,0,1-.81-.41l-2.12-2.92A18.66,18.66,0,0,0,15,18.25V22a1,1,0,0,1-1.6.8l-12-9a1,1,0,0,1,0-1.6l12-9A1,1,0,0,1,15,4V8.24A19,19,0,0,1,31,27v1a1,1,0,0,1-.69.95A1.12,1.12,0,0,1,30,29ZM14,16.11h.1A20.68,20.68,0,0,1,28.69,24.5l.16.21a17,17,0,0,0-15-14.6,1,1,0,0,1-.89-1V6L3.67,13,13,20V17.11a1,1,0,0,1,.33-.74A1,1,0,0,1,14,16.11Z"/>
        </svg>
        返回上一頁
      </button>
    </div>

    <h2 class="text-5xl text-center font-bold mb-2">國文</h2>
    <div
      class="bg-gray-200 rounded-lg shadow-md h-auto w-auto mb-4 overflow-hidden"
    >
      <div class="grid grid-cols-2 bg-gray-300 p-4 font-semibold border-b">
        <div>題目</div>
        <div class="text-right">類型</div>
      </div>

      <!-- 載入中動畫 -->
      <div v-if="loading">
        <div
          v-for="i in 9"
          :key="i"
          class="grid grid-cols-2 p-4 border-b animate-pulse"
        >
          <div class="h-6 bg-gray-300 rounded w-3/4"></div>
          <div class="h-6 bg-gray-300 rounded w-1/4 ml-auto"></div>
        </div>
      </div>

      <!-- 實際題目列表 -->
      <div v-else>
        <div
          v-for="(item, index) in topics"
          :key="index"
          class="grid grid-cols-2 p-4 border-b hover:bg-gray-300"
        >
          <div class="text-blue-500 hover:underline cursor-pointer">
            {{ item.title }}
          </div>
          <div class="text-right">{{ item.type }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { definePageMeta } from '#imports';

definePageMeta({
  pageTransition: {
    name: 'page-fade',
    mode: 'out-in'
  }
});

// 題目數據
const topics = ref([
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
  {
    title: "「由國家出資的遺征計畫，經費較高，卻少有重大發現。官方......」",
    type: "選擇題",
  },
]);

// 載入狀態
const loading = ref(true);

// 模擬載入過程
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 2000); // 顯示載入動畫2秒
});
</script>
