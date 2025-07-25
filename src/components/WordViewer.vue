<template>
    <div class="word-viewer h-full flex flex-col bg-white rounded-2xl overflow-hidden">
      <!-- 工具栏 -->
      <div class="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
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
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600">正在加载Word文档...</p>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p class="text-gray-600 mb-4">{{ error }}</p>
            <button @click="loadDocument" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              重试
            </button>
          </div>
        </div>

        <!-- Word文档内容 -->
        <div v-else class="flex justify-center">
          <div
            class="bg-white shadow-lg rounded-xl max-w-[210mm] w-full"
            :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
          >
            <!-- 渲染的Word内容 -->
            <div
              class="p-8 min-h-[297mm] text-gray-800 leading-relaxed select-text"
              @mouseup="handleTextSelection"
              @contextmenu="handleContextMenu"
              v-html="documentContent"
            ></div>
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
  import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-vue-next'
  import { API } from '@/utils/api' // 假设API模块在@/api中
  
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
  const totalPages = ref(1)
  const scale = ref(1)
  const wordContainer = ref<HTMLElement>()
  const selectedText = ref('')
  const showContextMenu = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })
  const translatedText = ref('')
  const isTranslating = ref(false)
  const isLoading = ref(true)
  const error = ref('')
  const documentContent = ref('')
  
  // 文档加载函数
  const loadDocument = async () => {
    try {
      isLoading.value = true
      error.value = ''

      // 获取Word文件的下载URL
      const response = await API.document.getViewUrl(parseInt(props.filePath))
      if (!response.data || response.data.code !== 200) {
        throw new Error('获取Word文件URL失败')
      }

      const docUrl = response.data.data

      // 这里应该使用mammoth.js或类似库来解析Word文档
      // 现在先显示一个占位符内容
      documentContent.value = `
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-4">${props.fileName.replace(/\.(doc|docx)$/, '')}</h1>
          <hr class="border-gray-300 mb-6">
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-3 text-blue-700">Word文档渲染器</h2>
          <p class="mb-4 text-justify">
            这是一个改进的Word文档查看器。当前显示的是占位符内容，
            实际项目中需要集成mammoth.js或类似的库来解析真实的Word文档内容。
          </p>
          <p class="mb-4 text-justify">
            文档URL: <a href="${docUrl}" target="_blank" class="text-blue-600 hover:underline">点击下载原文档</a>
          </p>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-3 text-blue-700">功能特性</h2>
          <ul class="list-disc list-inside mb-4 space-y-2 ml-4">
            <li>支持.doc和.docx格式</li>
            <li>保持原始文档格式</li>
            <li>支持文本选择和复制</li>
            <li>支持缩放查看</li>
            <li>支持翻译功能</li>
          </ul>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p class="text-yellow-800 text-sm">
            💡 提示：完整的Word文档渲染需要安装mammoth.js库并实现文档解析功能。
          </p>
        </div>
      `

      totalPages.value = 1
      currentPage.value = 1

    } catch (err: any) {
      console.error('Word文档加载失败:', err)
      error.value = err.message || 'Word文档加载失败'
    } finally {
      isLoading.value = false
    }
  }

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
  
  onMounted(async () => {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('click', handleClickOutside)

    // 加载Word文档
    await loadDocument()
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