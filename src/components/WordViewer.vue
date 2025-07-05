<template>
    <div class="word-viewer h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl overflow-hidden">
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
              <Plus :size="16" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Word内容区域 -->
      <div class="flex-1 overflow-auto bg-gray-100 p-4" ref="wordContainer">
        <div class="flex justify-center">
          <div 
            class="bg-white shadow-lg rounded-xl max-w-[210mm] w-full"
            :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
          >
            <!-- 模拟Word文档内容 -->
            <div 
              class="p-8 min-h-[297mm] text-gray-800 leading-relaxed select-text"
              @mouseup="handleTextSelection"
              @contextmenu="handleContextMenu"
            >
              <div v-if="currentPage === 1">
                <div class="text-center mb-8">
                  <h1 class="text-3xl font-bold mb-4">{{ fileName.replace(/\.(doc|docx)$/, '') }}</h1>
                  <hr class="border-gray-300 mb-6">
                </div>
                
                <div class="mb-6">
                  <h2 class="text-xl font-semibold mb-3 text-blue-700">文档概述</h2>
                  <p class="mb-4 text-justify">
                    这是一个Word文档的预览界面。在实际应用中，这里会显示真实的Word文档内容。
                    Word文档支持丰富的格式设置，包括字体样式、段落格式、表格、图片等多种元素。
                  </p>
                  <p class="mb-4 text-justify">
                    您可以使用以下功能来浏览文档：
                  </p>
                  <ul class="list-disc list-inside mb-4 space-y-2 ml-4">
                    <li>使用工具栏按钮进行页面导航</li>
                    <li>调整文档的缩放比例</li>
                    <li>选择文本进行复制或翻译</li>
                    <li>使用键盘快捷键快速操作</li>
                  </ul>
                </div>
                
                <div class="mb-6">
                  <h2 class="text-xl font-semibold mb-3 text-blue-700">主要特性</h2>
                  <div class="border border-gray-300 rounded p-4 bg-blue-50">
                    <h3 class="font-medium mb-2 text-blue-800">📝 格式支持</h3>
                    <p class="text-sm text-blue-700 mb-3">支持Word文档的基本格式显示</p>
                    
                    <h3 class="font-medium mb-2 text-blue-800">🔍 文本操作</h3>
                    <p class="text-sm text-blue-700 mb-3">支持文本选择、复制和翻译功能</p>
                    
                    <h3 class="font-medium mb-2 text-blue-800">⌨️ 快捷键</h3>
                    <p class="text-sm text-blue-700">支持键盘快捷键操作</p>
                  </div>
                </div>
              </div>
              
              <div v-else-if="currentPage === 2">
                <h1 class="text-2xl font-bold mb-6 text-blue-700">第二页内容</h1>
                
                <div class="mb-6">
                  <h2 class="text-xl font-semibold mb-3">技术说明</h2>
                  <p class="mb-4 text-justify">
                    此Word查看器采用模拟方式展示文档内容。在实际应用中，可以集成专业的文档预览库，
                    如Microsoft Office Online、OnlyOffice等，以实现完整的Word文档渲染。
                  </p>
                  
                  <table class="w-full border-collapse border border-gray-300 mb-4">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="border border-gray-300 p-3 text-left">功能</th>
                        <th class="border border-gray-300 p-3 text-left">支持情况</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-gray-300 p-3">文本显示</td>
                        <td class="border border-gray-300 p-3">✅ 支持</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 p-3">图片显示</td>
                        <td class="border border-gray-300 p-3">⚠️ 部分支持</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 p-3">表格显示</td>
                        <td class="border border-gray-300 p-3">✅ 支持</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div v-else>
                <h1 class="text-2xl font-bold mb-6 text-blue-700">第{{ currentPage }}页</h1>
                
                <div class="mb-6">
                  <h2 class="text-xl font-semibold mb-3">示例内容</h2>
                  <p class="mb-4 text-justify">
                    这是第{{ currentPage }}页的内容。在真实的Word查看器中，这里会显示Word文档的实际内容，
                    包括文本、图片、表格、图表等各种元素。
                  </p>
                  
                  <div class="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                    <h3 class="font-medium text-yellow-800 mb-2">💡 快捷键提示</h3>
                    <p class="text-yellow-700 text-sm">
                      • 使用方向键（←→）或空格键来翻页<br>
                      • 使用+/-键调整缩放比例<br>
                      • 使用Ctrl+滚轮进行缩放<br>
                      • 选择文本后右键可进行复制或翻译
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
  import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-vue-next'
  
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
  const totalPages = ref(4) // 模拟4页文档
  const scale = ref(1)
  const wordContainer = ref<HTMLElement>()
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
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockTranslation = `翻译结果: ${selectedText.value}`
        translatedText.value = mockTranslation
      } catch (error) {
        translatedText.value = '翻译失败，请重试'
      } finally {
        isTranslating.value = false
      }
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
  .word-viewer {
    font-family: 'Times New Roman', Times, serif;
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
  </style>