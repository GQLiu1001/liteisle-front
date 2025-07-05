<template>
  <div class="pdf-viewer h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl overflow-hidden">
    <!-- 工具栏 -->
    <div class="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
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
      
      <!-- 页面控制 -->
      <div class="flex items-center gap-3">
        <button 
          @click="previousPage" 
          :disabled="currentPage <= 1"
          class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft :size="20" />
        </button>
        
        <span class="text-sm text-gray-600">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage >= totalPages"
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
            <FileText :size="16" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- PDF内容区域 -->
    <div class="flex-1 overflow-auto bg-gray-100 p-4" ref="pdfContainer">
      <div class="flex justify-center">
        <div 
          class="bg-white shadow-lg rounded-xl max-w-[210mm] w-full"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
        >
          <!-- 模拟PDF页面内容 -->
          <div 
            class="p-8 min-h-[297mm] text-gray-800 leading-relaxed select-text"
            @mouseup="handleTextSelection"
            @contextmenu="handleContextMenu"
          >
            <div v-if="currentPage === 1">
              <h1 class="text-3xl font-bold mb-6 text-center">{{ fileName.replace('.pdf', '') }}</h1>
              
              <div class="mb-6">
                <h2 class="text-xl font-semibold mb-3">概述</h2>
                <p class="mb-4">
                  这是一个PDF文档的预览界面。在实际应用中，这里会显示真实的PDF内容。
                  本文档演示了PDF查看器的基本功能，包括页面导航、缩放控制等。
                </p>
                <p class="mb-4">
                  您可以使用顶部工具栏中的按钮来：
                </p>
                <ul class="list-disc list-inside mb-4 space-y-1">
                  <li>前进或后退页面</li>
                  <li>查看当前页面和总页数</li>
                  <li>放大或缩小文档</li>
                  <li>返回文档列表</li>
                </ul>
              </div>
              
              <div class="mb-6">
                <h2 class="text-xl font-semibold mb-3">主要特性</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div class="border border-gray-200 p-4 rounded">
                    <h3 class="font-medium mb-2">响应式设计</h3>
                    <p class="text-sm text-gray-600">自适应不同屏幕尺寸</p>
                  </div>
                  <div class="border border-gray-200 p-4 rounded">
                    <h3 class="font-medium mb-2">键盘快捷键</h3>
                    <p class="text-sm text-gray-600">支持方向键翻页</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="currentPage === 2">
              <h1 class="text-2xl font-bold mb-6">第二页内容</h1>
              
              <div class="mb-6">
                <h2 class="text-xl font-semibold mb-3">技术实现</h2>
                <p class="mb-4">
                  该PDF查看器使用Vue 3和TypeScript构建，具有以下技术特点：
                </p>
                
                <div class="bg-gray-50 p-4 rounded mb-4">
                  <h3 class="font-medium mb-2">前端技术栈</h3>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>Vue 3 Composition API</li>
                    <li>TypeScript 类型安全</li>
                    <li>Tailwind CSS 样式框架</li>
                    <li>Lucide Vue 图标库</li>
                  </ul>
                </div>
                
                <div class="bg-gray-50 p-4 rounded mb-4">
                  <h3 class="font-medium mb-2">组件特性</h3>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>模块化组件设计</li>
                    <li>响应式状态管理</li>
                    <li>事件驱动架构</li>
                    <li>可扩展的界面</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div v-else>
              <h1 class="text-2xl font-bold mb-6">第{{ currentPage }}页</h1>
              
              <div class="mb-6">
                <h2 class="text-xl font-semibold mb-3">示例内容</h2>
                <p class="mb-4">
                  这是第{{ currentPage }}页的内容。在真实的PDF查看器中，这里会显示PDF文件的实际内容。
                </p>
                
                <div class="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
                  <h3 class="font-medium text-blue-800 mb-2">💡 快捷键提示</h3>
                  <p class="text-blue-700 text-sm">
                    • 使用方向键（←→）或空格键来翻页<br>
                    • 使用+/-键调整缩放比例<br>
                    • 使用Ctrl+滚轮进行缩放
                  </p>
                </div>
                
                <div class="text-center text-gray-500 text-sm mt-8">
                  <p>页面 {{ currentPage }} / {{ totalPages }}</p>
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
        @click.stop="translateText"
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
import { ChevronLeft, ChevronRight, Minus, FileText } from 'lucide-vue-next'

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
const currentPage = ref(1)
const totalPages = ref(5) // 模拟5页文档
const scale = ref(1)
const pdfContainer = ref<HTMLElement>()
const selectedText = ref('')
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const translatedText = ref('')
const isTranslating = ref(false)

// 页面导航
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
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

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
    case 'PageUp':
      event.preventDefault()
      previousPage()
      break
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      event.preventDefault()
      nextPage()
      break
    case 'Escape':
      event.preventDefault()
      // 可以通过ref调用parent的方法或emit事件
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
  }
}

// Ctrl+滚轮缩放
const handleWheel = (event: WheelEvent) => {
  // 只有在按住Ctrl键时才进行缩放
  if (event.ctrlKey) {
    event.preventDefault()
    
    // 滚轮向上为负值，向下为正值
    if (event.deltaY < 0) {
      // 向上滚动，放大
      zoomIn()
    } else {
      // 向下滚动，缩小
      zoomOut()
    }
  }
}

// 文本选择处理
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

// 右键菜单处理
const handleContextMenu = (event: MouseEvent) => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    event.preventDefault()
    selectedText.value = selection.toString().trim()
    contextMenuPosition.value = { x: event.clientX, y: event.clientY }
    showContextMenu.value = true
  }
}

// 复制文本
const copyText = async () => {
  const textToCopy = translatedText.value || selectedText.value
  if (textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      // 复制后关闭菜单
      showContextMenu.value = false
      translatedText.value = ''
      isTranslating.value = false
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
}

// 翻译文本
const translateText = async () => {
  if (selectedText.value) {
    isTranslating.value = true
    translatedText.value = ''
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 这里应该调用真实的翻译API
      // 现在先用模拟翻译结果
      const mockTranslation = `翻译结果: ${selectedText.value}`
      translatedText.value = mockTranslation
      
    } catch (error) {
      translatedText.value = '翻译失败，请重试'
    } finally {
      isTranslating.value = false
    }
  }
}

// 关闭右键菜单
const closeContextMenu = () => {
  showContextMenu.value = false
  translatedText.value = ''
  isTranslating.value = false
}

// 点击其他地方关闭右键菜单
const handleClickOutside = (event: MouseEvent) => {
  if (showContextMenu.value) {
    // 检查点击的元素是否在右键菜单内部
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
.pdf-viewer {
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
  background-color: #3b82f6;
  color: white;
}

.select-text::-moz-selection {
  background-color: #3b82f6;
  color: white;
}

/* 滚动条样式 */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 打印样式模拟 */
@media print {
  .pdf-viewer {
    background: white;
  }
}
</style> 