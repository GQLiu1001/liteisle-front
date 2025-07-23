<template>
  <div class="powerpoint-viewer h-full flex flex-col bg-gray-800 text-white rounded-2xl overflow-hidden">
    <!-- 工具栏 -->
    <div class="flex-shrink-0 bg-gray-900 p-3 flex items-center justify-between">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <button @click="$emit('close')" class="flex items-center gap-2 text-gray-600 hover:text-gray-800 flex-shrink-0">
          <ChevronLeft :size="20" />
          <span>返回列表</span>
        </button>
        
        <!-- 文档信息 -->
        <div class="flex-1 min-w-0 ml-4 border-l border-gray-300 pl-4">
          <h3 class="font-medium text-gray-900 truncate">{{ fileName }}</h3>
        </div>
      </div>
      
      <!-- 幻灯片控制 -->
      <div class="flex items-center gap-3">
        <button 
          @click="previousSlide" 
          :disabled="currentSlide <= 1"
          class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft :size="20" />
        </button>
        
        <span class="text-sm text-gray-600">
          {{ currentSlide }} / {{ totalSlides }}
        </span>
        
        <button 
          @click="nextSlide" 
          :disabled="currentSlide >= totalSlides"
          class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight :size="20" />
        </button>
        
        <!-- 缩放控制 -->
        <div class="border-l border-gray-300 pl-3 ml-3 flex items-center gap-2">
          <button @click="zoomOut" class="p-2 rounded hover:bg-gray-200">
            <Minus :size="16" />
          </button>
          
          <span class="text-sm text-gray-600 min-w-[4rem] text-center">
            {{ Math.round(scale * 100) }}%
          </span>
          
          <button @click="zoomIn" class="p-2 rounded hover:bg-gray-200">
            <Plus :size="16" />
          </button>
          
          <!-- 全屏按钮 -->
          <button @click="toggleFullscreen" class="p-2 rounded hover:bg-gray-200 ml-2">
            <Maximize :size="16" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- PPT内容区域 -->
    <div class="flex-1 overflow-auto bg-gray-800 p-4 flex items-center justify-center" ref="pptContainer">
      <div 
        class="bg-white shadow-lg rounded-xl w-full max-w-[1200px]"
        :style="{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          aspectRatio: '16/9'
        }"
      >
        <!-- 模拟PPT幻灯片内容 -->
        <div 
          class="w-full h-full p-8 text-gray-800 flex flex-col justify-center select-text"
          @mouseup="handleTextSelection"
          @contextmenu="handleContextMenu"
        >
          <div v-if="currentSlide === 1" class="text-center">
            <h1 class="text-4xl font-bold mb-6 text-blue-600">{{ fileName.replace(/\.(ppt|pptx)$/, '') }}</h1>
            <hr class="border-blue-300 mb-8 w-1/2 mx-auto">
            <h2 class="text-2xl text-gray-700 mb-4">演示文稿</h2>
            <p class="text-lg text-gray-600">PowerPoint文档预览 - 标准16:9比例</p>
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-blue-100 rounded-lg p-4">
                <p class="text-blue-800 text-sm font-medium">共 {{ totalSlides }} 张幻灯片</p>
              </div>
              <div class="bg-green-100 rounded-lg p-4">
                <p class="text-green-800 text-sm font-medium">16:9 标准比例</p>
              </div>
              <div class="bg-purple-100 rounded-lg p-4">
                <p class="text-purple-800 text-sm font-medium">快捷键操作</p>
              </div>
            </div>
          </div>
          
          <div v-else-if="currentSlide === 2">
            <h1 class="text-3xl font-bold mb-8 text-orange-600">功能介绍</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              <div class="bg-orange-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-4 text-orange-700">📊 演示文稿查看</h3>
                <ul class="text-gray-700 space-y-2">
                  <li>• 幻灯片导航</li>
                  <li>• 缩放控制</li>
                  <li>• 全屏模式</li>
                  <li>• 标准比例显示</li>
                </ul>
              </div>
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-4 text-blue-700">🔧 交互功能</h3>
                <ul class="text-gray-700 space-y-2">
                  <li>• 文本选择</li>
                  <li>• 复制翻译</li>
                  <li>• 键盘快捷键</li>
                  <li>• 专业布局</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div v-else-if="currentSlide === 3">
            <h1 class="text-3xl font-bold mb-8 text-green-600">技术特性</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-green-50 border-l-4 border-green-500 p-6">
                <h3 class="text-xl font-semibold mb-3 text-green-700">标准比例</h3>
                <p class="text-gray-700 text-sm">保持16:9标准幻灯片比例，确保演示效果的专业性</p>
              </div>
              
              <div class="bg-blue-50 border-l-4 border-blue-500 p-6">
                <h3 class="text-xl font-semibold mb-3 text-blue-700">快捷键支持</h3>
                <p class="text-gray-700 text-sm">支持键盘快捷键操作，提高使用效率</p>
              </div>
              
              <div class="bg-purple-50 border-l-4 border-purple-500 p-6">
                <h3 class="text-xl font-semibold mb-3 text-purple-700">文本交互</h3>
                <p class="text-gray-700 text-sm">支持文本选择、复制和翻译功能</p>
              </div>
            </div>
          </div>
          
          <div v-else>
            <div class="text-center">
              <h1 class="text-3xl font-bold mb-8 text-gray-700">第{{ currentSlide }}张幻灯片</h1>
              
              <div class="bg-gray-50 rounded-lg p-8 mb-6">
                <h2 class="text-xl font-semibold mb-4">示例内容</h2>
                <p class="text-gray-600 mb-4 text-justify">
                  这是第{{ currentSlide }}张幻灯片的内容。在真实的PowerPoint查看器中，
                  这里会显示演示文稿的实际内容，包括文本、图片、图表、动画等元素。
                  幻灯片保持标准16:9比例显示。
                </p>
              </div>
              
              <div class="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <h3 class="font-medium text-yellow-800 mb-2">💡 快捷键提示</h3>
                <div class="text-yellow-700 text-sm space-y-1">
                  <div>• ← → 切换幻灯片</div>
                  <div>• + - 调整缩放</div>
                  <div>• F 全屏模式</div>
                  <div>• 空格 下一张</div>
                </div>
                <div class="mt-3 text-xs text-yellow-600">
                  标准16:9比例 (1920×1080)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="showContextMenu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      class="context-menu fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[150px] max-w-[300px]"
    >
      <button
        @click.stop="copyText"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        📋 复制{{ translatedText ? '译文' : '' }}
      </button>
      <button
        @click.stop="translateSelection"
        :disabled="isTranslating"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
      >
        🌐 翻译
      </button>
      
      <!-- 翻译结果区域 -->
      <div v-if="isTranslating || translatedText" class="border-t border-gray-200 mt-2">
        <div v-if="isTranslating" class="px-4 py-3 text-xs text-gray-500">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            翻译中...
          </div>
        </div>
        <div v-else-if="translatedText" class="px-4 py-3">
          <div class="text-xs text-gray-500 mb-1">译文:</div>
          <div class="text-sm text-gray-800 leading-relaxed">{{ translatedText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, Minus, Plus, Maximize } from 'lucide-vue-next'
import { API } from '@/utils/api'

interface Props {
  filePath: string
  fileName: string
  fileDescription?: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

// 状态
const currentSlide = ref(1)
const totalSlides = ref(6) // 模拟6张幻灯片
const scale = ref(1)
const pptContainer = ref<HTMLElement>()
const selectedText = ref('')
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const translatedText = ref('')
const isTranslating = ref(false)

// 幻灯片导航
const previousSlide = () => {
  if (currentSlide.value > 1) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < totalSlides.value) {
    currentSlide.value++
  }
}

// 缩放控制
const zoomIn = () => {
  if (scale.value < 2) {
    scale.value = Math.min(2, scale.value + 0.25)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25)
  }
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    pptContainer.value?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 文本选择和右键菜单功能（复用PDF查看器的逻辑）
const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim()
  } else {
    selectedText.value = ''
    showContextMenu.value = false
    translatedText.value = ''
    isTranslating.value = false
  }
}

const handleContextMenu = (event: MouseEvent) => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    event.preventDefault()
    selectedText.value = selection.toString().trim()
    contextMenuPosition.value = { x: event.clientX, y: event.clientY }
    showContextMenu.value = true
  }
}

const copyText = async () => {
  const textToCopy = translatedText.value || selectedText.value
  if (textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      showContextMenu.value = false
      translatedText.value = ''
      isTranslating.value = false
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
}

const translateSelection = async () => {
  if (!selectedText.value) return
  
  isTranslating.value = true
  try {
           const response = await API.translate.translate({
         file_name: 'selected_text.txt',
         text: selectedText.value,
         target_lang: 'zh-CN'
       })
    if (response.data) {
      translatedText.value = response.data.translated_text
    }
  } catch (error) {
    console.error('翻译失败:', error)
    translatedText.value = '翻译服务暂不可用'
  } finally {
    isTranslating.value = false
  }
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
    case 'PageUp':
      event.preventDefault()
      previousSlide()
      break
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      event.preventDefault()
      nextSlide()
      break
    case '=':
    case '+':
      event.preventDefault()
      zoomIn()
      break
    case '-':
      event.preventDefault()
      zoomOut()
      break
    case 'f':
    case 'F':
      event.preventDefault()
      toggleFullscreen()
      break
  }
}

// Ctrl+滚轮缩放
const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) {
    event.preventDefault()
    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

// 点击其他地方关闭右键菜单
const handleClickOutside = (event: MouseEvent) => {
  if (showContextMenu.value) {
    const target = event.target as Element
    const contextMenu = document.querySelector('.context-menu')
    
    if (contextMenu && !contextMenu.contains(target)) {
      showContextMenu.value = false
      translatedText.value = ''
      isTranslating.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('wheel', handleWheel, { passive: false })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('wheel', handleWheel)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.ppt-viewer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* 文本选择样式 */
.select-text {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.select-text::selection {
  background-color: #f59e0b;
  color: white;
}

.select-text::-moz-selection {
  background-color: #f59e0b;
  color: white;
}

/* 滚动条样式 */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #1f2937;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style> 