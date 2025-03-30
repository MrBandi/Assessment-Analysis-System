<template>
    <div class="fixed top-30 right-0 w-[400px] h-[800px] z-10 overflow-hidden mr-30" ref="containerRef">
        <canvas id="live2d-canvas" class="w-full h-full" />
    </div>
</template>

<script setup>
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import { onMounted, ref } from 'vue';

window.PIXI = PIXI;
const containerRef = ref(null);

onMounted(async () => {
    try {
        console.log('Initializing Live2D...');
        
        // Get container dimensions
        const container = containerRef.value;
        const canvasWidth = container.clientWidth;
        const canvasHeight = container.clientHeight;
        
        // Create PIXI application
        const app = new PIXI.Application({
            width: canvasWidth,
            height: canvasHeight,
            transparent: true,
            view: document.getElementById('live2d-canvas'),
            resizeTo: container, // Bind resize to container
        });
        
        console.log('Loading model...');
        
        // Load model
        const model = await Live2DModel.from('https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json');
        
        app.stage.addChild(model);
        
        // Set position to center of canvas
        model.x = canvasWidth / 2;
        model.y = canvasHeight / 2;
        
        // Adjust scale to fit model in canvas
        const scale = Math.min(
            (canvasWidth * 1.2) / model.width,
            (canvasHeight * 1.1) / model.height
        );
        model.scale.set(scale, scale);
        
        // Set anchor to center of the model
        model.anchor.set(0.5, 0.5);
        
        console.log('Live2D model initialized successfully!');
        
        model.on("hit", () => {
            console.log('Model clicked');
            if (model.expression) {
                model.expression('f05');
            }
        });
    } catch (error) {
        console.error('Failed to initialize Live2D:', error);
    }
});
</script>
