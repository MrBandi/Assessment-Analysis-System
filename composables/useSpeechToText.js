// composables/useSpeechToText.js
import { ref, onUnmounted, onMounted } from 'vue'

export const useSpeechToText = () => {
  const text = ref('')
  const isListening = ref(false)
  const isSupportedAPI = ref(false)
  const error = ref(null)
  
  let recognition = null
  
  // 檢查瀏覽器是否支援語音識別 API
  const checkBrowserSupport = () => {
    // 確保只在客戶端執行
    if (!import.meta.client) {
      return false
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      error.value = '您的瀏覽器不支援語音識別功能'
      isSupportedAPI.value = false
      return false
    }
    
    isSupportedAPI.value = true
    return true
  }
  
  // 初始化語音識別
  const initRecognition = (language = 'zh-TW') => {
    // 確保只在客戶端執行
    if (!import.meta.client) return
    
    if (!checkBrowserSupport()) return
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language
    
    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }
    
    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      // 更新文字
      text.value = finalTranscript || interimTranscript
    }
    
    recognition.onerror = (event) => {
      error.value = `錯誤：${event.error}`
    }
    
    recognition.onend = () => {
      isListening.value = false
    }
  }
  
  // 開始語音識別
  const startListening = (language = 'zh-TW') => {
    // 確保只在客戶端執行
    if (!import.meta.client) return
    
    if (isListening.value) return
    
    if (!recognition) {
      initRecognition(language)
    }
    
    if (!recognition) {
      error.value = '語音識別初始化失敗'
      return
    }
    
    try {
      recognition.start()
    } catch (err) {
      error.value = `無法啟動語音識別：${err.message}`
    }
  }
  
  // 停止語音識別
  const stopListening = () => {
    if (!isListening.value || !recognition) return
    
    try {
      recognition.stop()
    } catch (err) {
      error.value = `無法停止語音識別：${err.message}`
    }
  }
  
  // 清除文字
  const clearText = () => {
    text.value = ''
  }
  
  // 組件掛載時進行客戶端初始化
  onMounted(() => {
    // 確保只在客戶端執行
    if (import.meta.client) {
      checkBrowserSupport()
    }
  })
  
  // 組件卸載時停止語音識別
  onUnmounted(() => {
    if (import.meta.client && recognition && isListening.value) {
      recognition.stop()
    }
  })
  
  return {
    text,
    isListening,
    isSupportedAPI,
    error,
    startListening,
    stopListening,
    clearText
  }
}