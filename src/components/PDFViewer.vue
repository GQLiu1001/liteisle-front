<template>
  <div class="pdf-viewer h-full flex flex-col bg-white rounded-2xl overflow-hidden">
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
          <div v-if="isLoading" class="text-xs text-gray-500">加载中...</div>
          <div v-else-if="error" class="text-xs text-red-500">{{ error }}</div>
        </div>
      </div>

      <!-- 页面控制 -->
      <div class="flex items-center gap-3">
        <button
          @click="previousPage"
          :disabled="currentPage <= 1 || isLoading"
          class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft :size="20" />
        </button>

        <span class="text-sm text-gray-600">
          {{ currentPage }} / {{ totalPages || '?' }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages || isLoading"
          class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight :size="20" />
        </button>

        <!-- 缩放控制 -->
        <div class="border-l border-gray-300 pl-3 ml-3 flex items-center gap-2">
          <button @click="zoomOut" class="p-2 rounded hover:bg-gray-200" :disabled="isLoading">
            <Minus :size="16" />
          </button>

          <span class="text-sm text-gray-600 min-w-[4rem] text-center">
            {{ Math.round(scale * 100) }}%
          </span>

          <button @click="zoomIn" class="p-2 rounded hover:bg-gray-200" :disabled="isLoading">
            <Plus :size="16" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- PDF内容区域 -->
    <div class="flex-1 overflow-auto bg-gray-100 p-4" ref="pdfContainer">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">正在加载PDF文档...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button @click="loadPDF" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            重试
          </button>
        </div>
      </div>

      <!-- PDF渲染区域 -->
      <div v-else class="flex justify-center">
        <div
          class="bg-white shadow-lg rounded-xl"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
        >
          <!-- 调试信息 -->
          <div class="p-4 text-sm text-gray-500 border-b">
            <p>调试信息:</p>
            <p>isLoading: {{ isLoading }}</p>
            <p>error: {{ error }}</p>
            <p>totalPages: {{ totalPages }}</p>
            <p>currentPage: {{ currentPage }}</p>
            <p>canvas ref: {{ pdfCanvas ? '已获取' : '未获取' }}</p>
          </div>

          <!-- PDF页面画布 -->
          <canvas
            ref="pdfCanvas"
            class="block rounded-xl"
            @mouseup="handleTextSelection"
            @contextmenu="handleContextMenu"
          ></canvas>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-vue-next'
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
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1)
const pdfContainer = ref<HTMLElement>()
const pdfCanvas = ref<HTMLCanvasElement>()
const selectedText = ref('')
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const translatedText = ref('')
const isTranslating = ref(false)
const isLoading = ref(true)
const error = ref('')

// PDF相关状态
let pdfDocument: any = null
let currentPageObject: any = null

// PDF加载函数
const loadPDF = async () => {
  console.log('开始加载PDF，文件路径:', props.filePath)

  try {
    isLoading.value = true
    error.value = ''

    console.log('设置加载状态为true')

    // 获取PDF文件的下载URL
    console.log('调用API获取PDF文件URL')
    const response = await API.document.getViewUrl(parseInt(props.filePath))
    console.log('API响应:', response)

    if (!response.data || response.data.code !== 200) {
      throw new Error('获取PDF文件URL失败')
    }

    const pdfUrl = response.data.data
    console.log('获取到PDF URL:', pdfUrl)

    // 动态导入PDF.js (如果已安装)
    // 注意：这里使用一个简化的实现，实际项目中需要安装pdfjs-dist
    // const pdfjsLib = await import('pdfjs-dist')

    // 临时使用fetch获取PDF数据并显示提示
    console.log('开始下载PDF文件')
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      throw new Error('PDF文件下载失败')
    }

    console.log('PDF文件下载成功')

    // 这里应该使用PDF.js解析PDF，现在先显示一个占位符
    totalPages.value = 1
    currentPage.value = 1

    console.log('设置页面信息，准备渲染')

    // 等待DOM更新后再渲染
    await nextTick()
    console.log('DOM更新完成，开始渲染')
    await renderPage()

  } catch (err: any) {
    console.error('PDF加载失败:', err)
    error.value = err.message || 'PDF加载失败'
  } finally {
    console.log('设置加载状态为false')
    isLoading.value = false
  }
}

// 渲染PDF页面
const renderPage = async () => {
  console.log('开始渲染PDF页面')
  console.log('pdfCanvas.value:', pdfCanvas.value)

  if (!pdfCanvas.value) {
    console.error('Canvas元素未找到')
    return
  }

  const canvas = pdfCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.error('无法获取Canvas 2D上下文')
    return
  }

  console.log('Canvas元素和上下文获取成功')

  // 设置画布大小 (A4比例)
  const width = 595 // A4宽度 (点)
  const height = 842 // A4高度 (点)

  canvas.width = width
  canvas.height = height
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  console.log(`Canvas大小设置为: ${width}x${height}`)

  // 清空画布
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // 绘制占位符内容
  ctx.fillStyle = '#333'
  ctx.font = '24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('PDF渲染器', width / 2, 100)

  ctx.font = '16px Arial'
  ctx.fillText(`文件名: ${props.fileName}`, width / 2, 150)
  ctx.fillText(`页面: ${currentPage.value} / ${totalPages.value}`, width / 2, 180)

  ctx.font = '14px Arial'
  ctx.fillStyle = '#666'
  ctx.fillText('注意：这是一个简化的PDF渲染器', width / 2, 250)
  ctx.fillText('完整功能需要安装pdfjs-dist库', width / 2, 280)

  // 绘制边框
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, width, height)

  console.log('PDF页面渲染完成')
}

// 页面导航
const previousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await renderPage()
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await renderPage()
  }
}

// 缩放控制
const zoomIn = async () => {
  if (scale.value < 3) {
    scale.value = Math.min(3, scale.value + 0.25)
    await nextTick()
    await renderPage()
  }
}

const zoomOut = async () => {
  if (scale.value > 0.25) {
    scale.value = Math.max(0.25, scale.value - 0.25)
    await nextTick()
    await renderPage()
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

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('wheel', handleWheel, { passive: false })
  document.addEventListener('click', handleClickOutside)

  // 加载PDF文档
  await loadPDF()
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