import { ref } from 'vue';
import { useLive2DModel } from './useLive2DModel';

export function useTextToSpeech() {
  const isPlaying = ref(false);
  const error = ref(null);
  const { startTalking, stopTalking, isInitialized } = useLive2DModel();
  
  /**
   * 使用 Google Cloud Text-to-Speech API 合成語音
   * 參考: https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
   */
  const synthesizeSpeech = async (text, options = {}) => {
    try {
      if (!options.apiKey) {
        throw new Error('Missing API key for Google Cloud Text-to-Speech');
      }
      
      // 建立請求
      const request = {
        input: {
          text: text
        },
        voice: {
          languageCode: options.languageCode || 'zh-TW',
          name: options.voiceName || 'zh-TW-Standard-A',
          ssmlGender: options.gender || 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: options.pitch || 0,
          speakingRate: options.speakingRate || 1
        }
      };
      
      // 記錄請求參數 (不包含敏感資訊)
      console.log('Google TTS 請求參數:', {
        ...request,
        input: { 
          text: text.length > 50 ? `${text.substring(0, 50)}...` : text 
        }
      });
      
      // 發送 REST API 請求
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${options.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        }
      );
      
      // 處理 API 錯誤
      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
          errorDetails = { error: { message: '無法解析錯誤響應' } };
        }
        
        console.error('Google Cloud Text-to-Speech API 錯誤:');
        console.error('- 狀態碼:', response.status);
        console.error('- 錯誤詳情:', errorDetails);
        
        const errorMessage = errorDetails.error?.message || response.statusText;
        throw new Error(`Google TTS API 錯誤 (${response.status}): ${errorMessage}`);
      }
      
      // 解析響應
      const data = await response.json();
      
      // 驗證響應包含音頻內容
      if (!data.audioContent) {
        throw new Error('API 響應中缺少音頻內容');
      }
      
      return data.audioContent;
    } catch (err) {
      console.error('Google Cloud Text-to-Speech 調用失敗:', err);
      throw err;
    }
  };
  
  /**
   * 播放音頻並處理相關事件
   */
  const playAudio = async (audioContent) => {
    try {
      // Base64 解碼
      const byteCharacters = atob(audioContent);
      const byteArray = new Uint8Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      
      // 創建音頻 Blob
      const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        // 開始播放
        audio.onplay = () => {
          console.log('開始播放音頻');
          isPlaying.value = true;
          if (isInitialized()) {
            startTalking();
          }
        };
        
        // 播放結束
        audio.onended = () => {
          console.log('音頻播放結束');
          isPlaying.value = false;
          if (isInitialized()) {
            stopTalking();
          }
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };
        
        // 播放錯誤
        audio.onerror = (err) => {
          const errorMsg = `音頻播放錯誤: ${err.message || '未知錯誤'}`;
          console.error(errorMsg, err);
          error.value = errorMsg;
          isPlaying.value = false;
          if (isInitialized()) {
            stopTalking();
          }
          URL.revokeObjectURL(audioUrl);
          reject(new Error(errorMsg));
        };
        
        // 播放音頻 (可能需要用戶交互)
        audio.play().catch(err => {
          console.error('無法開始音頻播放:', err);
          error.value = `無法播放音頻: ${err.message}`;
          URL.revokeObjectURL(audioUrl);
          reject(err);
        });
      });
    } catch (err) {
      console.error('處理音頻失敗:', err);
      throw err;
    }
  };
  
  /**
   * 主要 speak 方法 - 合成並播放語音
   */
  const speak = async (text, options = {}) => {
    if (!text || text.trim() === '') {
      console.warn('文本為空，不進行語音合成');
      return false;
    }

    console.log('開始語音合成:', options);
    
    try {
      // 重置錯誤狀態
      error.value = null;
      
      // 驗證 API key
      if (!options.apiKey || options.apiKey.trim() === '') {
        const errorMsg = 'Google Cloud Text-to-Speech API 金鑰未提供';
        console.error(errorMsg);
        error.value = errorMsg;
        return false;
      }
      
      // 記錄語音請求參數
      console.log('執行語音合成:');
      console.log('- 語言:', options.languageCode || 'zh-TW');
      console.log('- 語音:', options.voiceName || 'zh-TW-Standard-A');
      console.log('- 性別:', options.gender || 'FEMALE');
      
      try {
        // 合成語音
        const audioContent = await synthesizeSpeech(text, options);
        
        // 播放語音
        return await playAudio(audioContent);
      } catch (ttsError) {
        // 處理 TTS 錯誤
        console.error('Google Cloud Text-to-Speech 錯誤:');
        console.error('- 錯誤訊息:', ttsError.message);
        console.error('- 完整錯誤:', ttsError);
        error.value = `語音合成錯誤: ${ttsError.message}`;
        return false;
      }
    } catch (generalError) {
      // 處理一般錯誤
      console.error('語音處理一般錯誤:', generalError);
      error.value = `語音處理錯誤: ${generalError.message}`;
      return false;
    }
  };
  
  /**
   * 停止語音播放
   */
  const stopSpeaking = () => {
    console.log('停止語音播放');
    isPlaying.value = false;
    if (isInitialized()) {
      stopTalking();
    }
  };
  
  return {
    speak,
    stopSpeaking,
    isPlaying,
    error
  };
}