import { reactive } from 'vue';

// 创建全局状态存储模型引用
const modelState = reactive({
  model: null,
  isInitialized: false,
  isTalking: false
});

export function useLive2DModel() {
  // 设置模型引用
  const setModel = (model) => {
    modelState.model = model;
    modelState.isInitialized = true;
    console.log('Live2D model reference set');
  };

  // 开始说话动画
  const startTalking = () => {
    if (!modelState.model) {
      console.warn('Cannot start talking: Model not initialized');
      return;
    }
    
    modelState.isTalking = true;
    startMouthAnimation();
  };

  // 停止说话动画
  const stopTalking = () => {
    if (!modelState.model) return;
    
    modelState.isTalking = false;
    stopMouthAnimation();
    
    // 重置嘴巴参数
    if (modelState.model.internalModel && modelState.model.internalModel.coreModel) {
      try {
        // 'ParamMouthOpenY' 是常见的口腔参数，但可能需要根据模型调整
        modelState.model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
        // 备用参数名，以防模型使用不同参数
        modelState.model.internalModel.coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', 0);
      } catch (error) {
        console.warn('Failed to reset mouth parameter:', error);
      }
    }
  };
  
  // 嘴巴动画控制
  let animationId = null;
  let mouthValue = 0;
  let direction = 1;
  
  const startMouthAnimation = () => {
    stopMouthAnimation(); // 先停止之前的动画
    
    const animate = () => {
      if (!modelState.isTalking || !modelState.model) {
        stopMouthAnimation();
        return;
      }
      
      // 更新嘴巴开合值 - 随机化以使动画更自然
      const speed = 0.05 + Math.random() * 0.1; // 随机速度
      mouthValue += speed * direction;
      
      if (mouthValue >= 0.8) {
        mouthValue = 0.8;
        direction = -1;
      } else if (mouthValue <= 0.1) {
        mouthValue = 0.1;
        direction = 1;
      }
      
      // 应用到模型
      if (modelState.model.internalModel && modelState.model.internalModel.coreModel) {
        try {
          // 尝试不同的参数名，因为不同模型可能使用不同命名
          try {
            modelState.model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', mouthValue);
          // eslint-disable-next-line no-unused-vars
          } catch (error) {
            // 尝试替代参数名
            modelState.model.internalModel.coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', mouthValue);
          }
        } catch (error) {
          console.warn('Failed to animate mouth:', error);
          stopMouthAnimation();
          return;
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
  };
  
  const stopMouthAnimation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    mouthValue = 0;
    direction = 1;
  };

  return {
    setModel,
    startTalking,
    stopTalking,
    isInitialized: () => modelState.isInitialized,
    isTalking: () => modelState.isTalking
  };
}
