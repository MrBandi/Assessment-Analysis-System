import { ref } from 'vue';
import { useLive2DModel } from './useLive2DModel';

export function useTextToSpeech() {
  const isPlaying = ref(false);
  const error = ref(null);
  const { startTalking, stopTalking, isInitialized } = useLive2DModel();
  
  // 使用浏览器原生Web Speech API
  const useBrowserTTS = async (text, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('瀏覽器不支援語音合成'));
        return;
      }
      
      // 确保语音合成服务已准备好
      const ensureVoicesLoaded = (timeout = 1000) => {
        return new Promise((resolveVoices) => {
          // 如果已有声音列表，立即返回
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            return resolveVoices(voices);
          }
          
          // 否则监听声音列表加载事件
          let voicesLoaded = false;
          function onVoicesChanged() {
            voicesLoaded = true;
            window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
            resolveVoices(window.speechSynthesis.getVoices());
          }
          
          window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
          
          // 设置超时保护
          setTimeout(() => {
            if (!voicesLoaded) {
              window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
              resolveVoices(window.speechSynthesis.getVoices() || []);
            }
          }, timeout);
        });
      };
      
      // 停止任何正在播放的语音
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 设置语言和其他选项
      utterance.lang = options.language || 'zh-TW';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      
      // 异步加载声音并选择合适的声音
      ensureVoicesLoaded().then(voices => {
        console.log('Available voices:', voices.length);
        const zhVoices = voices.filter(voice => voice.lang.includes('zh'));
        console.log('Chinese voices:', zhVoices.map(v => `${v.name} (${v.lang})`));
        
        // 尝试找匹配的声音
        const preferredVoice = voices.find(voice => 
          voice.lang.includes(options.language || 'zh-TW') ||
          voice.lang.includes('zh')
        );
        
        if (preferredVoice) {
          console.log('Selected voice:', preferredVoice.name, preferredVoice.lang);
          utterance.voice = preferredVoice;
        } else {
          console.warn('No matching voice found for', options.language || 'zh-TW');
        }
        
        // 开始播放前触发动画
        utterance.onstart = () => {
          console.log('Speech started');
          isPlaying.value = true;
          if (isInitialized()) {
            startTalking();
          }
        };
        
        // 播放结束停止动画
        utterance.onend = () => {
          console.log('Speech ended');
          isPlaying.value = false;
          if (isInitialized()) {
            stopTalking();
          }
          resolve(true);
        };
        
        // 错误处理
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          isPlaying.value = false;
          stopTalking();
          error.value = `語音合成錯誤: ${event.error}`;
          reject(new Error(error.value));
        };
        
        // 播放语音
        try {
          // 使用用户交互事件处理程序内启动
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Failed to start speech:', e);
          reject(new Error(`播放語音失敗: ${e.message}`));
        }
      });
    });
  };
  
  // 使用Google Cloud TTS API (需要API密钥)
  const useGoogleTTS = async (text, options = {}) => {
    try {
      // 验证API密钥是否存在
      if (!options.apiKey || options.apiKey.trim() === '') {
        throw new Error('Google TTS API密鑰未提供');
      }
      
      console.log('Using Google TTS API with language:', options.language || 'zh-TW');
      
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${options.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: {
              text: text
            },
            voice: {
              languageCode: options.language || 'zh-TW',
              name: options.voice || 'zh-TW-Standard-A',
              ssmlGender: options.gender || 'FEMALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: options.pitch || 0,
              speakingRate: options.rate || 1
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google TTS API error:', errorData);
        throw new Error(`Google TTS API錯誤: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // 验证数据包含音频内容
      if (!data.audioContent) {
        throw new Error('Google TTS API返回的數據中沒有音頻內容');
      }
      
      // 将base64编码的音频转换为二进制
      const audioContent = data.audioContent;
      const byteCharacters = atob(audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        // 开始播放时触发动画
        audio.onplay = () => {
          console.log('Audio playback started');
          isPlaying.value = true;
          if (isInitialized()) {
            startTalking();
          }
        };
        
        // 结束时停止动画
        audio.onended = () => {
          console.log('Audio playback ended');
          isPlaying.value = false;
          if (isInitialized()) {
            stopTalking();
          }
          URL.revokeObjectURL(audioUrl); // 释放资源
          resolve(true);
        };
        
        // 错误处理
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          error.value = `音頻播放錯誤: ${e.message || '未知錯誤'}`;
          isPlaying.value = false;
          stopTalking();
          URL.revokeObjectURL(audioUrl);
          reject(new Error(error.value));
        };
        
        // 播放音频
        // 注意：浏览器可能阻止非用户交互触发的自动播放
        audio.play().catch(e => {
          console.error('Failed to start audio playback:', e);
          error.value = `無法開始播放: ${e.message}`;
          reject(new Error(error.value));
        });
      });
    } catch (e) {
      error.value = e.message;
      isPlaying.value = false;
      console.error('Google TTS error:', e);
      throw e;
    }
  };
  
  // 统一的语音合成方法
  const speak = async (text, options = {}) => {
    if (!text) return false;
    
    try {
      error.value = null;
      
      // 首先检查是否有有效的API密钥
      const hasValidApiKey = options.apiKey && options.apiKey.trim() !== '';
      
      // 如果有API密钥，尝试使用Google TTS
      if (hasValidApiKey) {
        try {
          console.log('Attempting to use Google TTS...');
          return await useGoogleTTS(text, options);
        } catch (googleError) {
          console.warn('Google TTS failed, falling back to browser TTS:', googleError);
          return await useBrowserTTS(text, options);
        }
      } else {
        // 否则直接使用浏览器TTS
        console.log('Using browser TTS...');
        return await useBrowserTTS(text, options);
      }
    } catch (e) {
      error.value = `語音合成失敗: ${e.message}`;
      console.error('Speech synthesis failed:', e);
      return false;
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      isPlaying.value = false;
    }
  };
  
  return {
    speak,
    stopSpeaking,
    isPlaying,
    error
  };
}