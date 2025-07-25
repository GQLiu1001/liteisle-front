<template>
  <div class="excel-viewer h-full flex flex-col bg-white rounded-2xl overflow-hidden">
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
      
      <!-- 工作表和缩放控制 -->
      <div class="flex items-center gap-3">
        <!-- 工作表选择 -->
        <select 
          v-model="currentSheet" 
          class="text-sm border border-gray-300 rounded px-2 py-1 min-w-[120px] max-w-[200px]"
        >
          <option v-for="sheet in sheets" :key="sheet.id" :value="sheet.id">
            {{ sheet.name }}
          </option>
        </select>
        
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
          
          <!-- 适合窗口 -->
          <button @click="fitToWindow" class="p-2 rounded hover:bg-gray-200 ml-2">
            <Maximize :size="16" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Excel内容区域 -->
    <div class="flex-1 overflow-auto bg-gray-100 p-4" ref="excelContainer">
      <div 
        ref="scaledElement"
        class="bg-white shadow-lg rounded-xl inline-block min-w-full"
        :style="{ transform: `scale(${scale})`, transformOrigin: '0 0' }"
      >
        <!-- 表格头部 -->
        <div class="flex border-b border-gray-300">
          <div class="w-12 h-8 bg-gray-200 border-r border-gray-300 flex items-center justify-center text-xs font-medium">
            
          </div>
          <div 
            v-for="col in columns" 
            :key="col"
            class="w-24 h-8 bg-gray-200 border-r border-gray-300 flex items-center justify-center text-xs font-medium"
          >
            {{ col }}
          </div>
        </div>
        
        <!-- 表格内容 -->
        <div 
          v-for="(row, rowIndex) in currentSheetData" 
          :key="rowIndex"
          class="flex border-b border-gray-300"
        >
          <!-- 行号 -->
          <div class="w-12 h-8 bg-gray-200 border-r border-gray-300 flex items-center justify-center text-xs font-medium">
            {{ rowIndex + 1 }}
          </div>
          
          <!-- 单元格 -->
          <div 
            v-for="(cell, colIndex) in row" 
            :key="colIndex"
            class="w-24 h-8 border-r border-gray-300 flex items-center px-2 text-xs hover:bg-blue-50 cursor-pointer select-text"
            @click="selectCell(rowIndex, colIndex)"
            @mouseup="handleTextSelection"
            @contextmenu="handleContextMenu"
            :class="{ 'bg-blue-100': selectedCell.row === rowIndex && selectedCell.col === colIndex }"
          >
            {{ cell }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
      <div class="flex items-center justify-between">
        <div>
          当前工作表: {{ currentSheetName }} | 
          已选择: {{ selectedCellAddress }}
        </div>
        <div class="flex items-center gap-4">
          <span>行数: {{ currentSheetData.length }}</span>
          <span>列数: {{ columns.length }}</span>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronLeft, Minus, Plus, Maximize } from 'lucide-vue-next'
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
const currentSheet = ref('sheet1')
const scale = ref(1)
const excelContainer = ref<HTMLElement>()
const scaledElement = ref<HTMLElement>()
const selectedCell = ref({ row: -1, col: -1 })
const selectedText = ref('')
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const translatedText = ref('')
const isTranslating = ref(false)

// 模拟Excel数据
const sheets = ref([
  { id: 'sheet1', name: '工作表1' },
  { id: 'sheet2', name: '数据分析' },
  { id: 'sheet3', name: '图表' }
])

const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']

// 移除模拟Excel数据，改为从API获取真实数据
const loadExcelData = async () => {
  try {
    // 调用真实API获取Excel数据
    // const response = await API.file.getExcelContent(props.fileId)
    // excelData.value = response.data
    console.log('从API加载Excel数据')
  } catch (error) {
    console.error('加载Excel数据失败:', error)
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

// 计算属性
const currentSheetData = computed(() => {
  // 返回空数组，等待从API加载数据
  return []
})

const currentSheetName = computed(() => {
  return sheets.value.find(s => s.id === currentSheet.value)?.name || ''
})

const selectedCellAddress = computed(() => {
  if (selectedCell.value.row >= 0 && selectedCell.value.col >= 0) {
    return `${columns[selectedCell.value.col]}${selectedCell.value.row + 1}`
  }
  return '未选择'
})

// 方法
const selectCell = (row: number, col: number) => {
  selectedCell.value = { row, col }
}

const zoomIn = () => {
  if (scale.value < 2) {
    const newScale = Math.min(2, scale.value + 0.25)
    centerZoom(newScale)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    const newScale = Math.max(0.5, scale.value - 0.25)
    centerZoom(newScale)
  }
}

const fitToWindow = () => {
  centerZoom(1)
}

const centerZoom = (newScale: number) => {
  const container = excelContainer.value
  if (!container) return

  const oldScale = scale.value
  const rect = container.getBoundingClientRect()

  const containerCenterX = rect.width / 2
  const containerCenterY = rect.height / 2

  const pointX = (container.scrollLeft + containerCenterX) / oldScale
  const pointY = (container.scrollTop + containerCenterY) / oldScale

  scale.value = newScale

  nextTick(() => {
    const newPointX = pointX * newScale
    const newPointY = pointY * newScale
    container.scrollLeft = newPointX - containerCenterX
    container.scrollTop = newPointY - containerCenterY
  })
}


// 文本选择和右键菜单功能
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

const translateText = async () => {
  if (selectedText.value) {
    isTranslating.value = true
    translatedText.value = ''
    
    try {
      const response = await API.translate.translate({
        file_name: 'selected_text.txt',
        text: selectedText.value,
        target_lang: 'zh-CN'
      }) as any;
      if (response.data && response.data.data && response.data.data.translated_text) {
        let text = response.data.data.translated_text;
        if (typeof text === 'string' && text.startsWith('"') && text.endsWith('"')) {
          try {
            text = JSON.parse(text);
          } catch (e) {
            // Not a valid JSON string, use as is.
          }
        }
        translatedText.value = text;
      } else {
        translatedText.value = response.data?.message || '未返回翻译结果';
      }
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
    case '=':
    case '+':
      event.preventDefault()
      zoomIn()
      break
    case '-':
      event.preventDefault()
      zoomOut()
      break
    case 'ArrowUp':
      if (selectedCell.value.row > 0) {
        selectedCell.value.row--
      }
      break
    case 'ArrowDown':
      if (selectedCell.value.row < currentSheetData.value.length - 1) {
        selectedCell.value.row++
      }
      break
    case 'ArrowLeft':
      if (selectedCell.value.col > 0) {
        selectedCell.value.col--
      }
      break
    case 'ArrowRight':
      if (selectedCell.value.col < columns.length - 1) {
        selectedCell.value.col++
      }
      break
  }
}

// Ctrl+滚轮缩放
const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) {
    event.preventDefault();

    const container = excelContainer.value;
    if (!container) return;

    // 1. 获取缩放前的信息
    const oldScale = scale.value;
    const rect = container.getBoundingClientRect();
    
    // 鼠标在容器内的坐标 (相对于视口)
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 鼠标指向的内容在缩放前的绝对坐标 (考虑了当前的滚动)
    const pointX = (container.scrollLeft + mouseX) / oldScale;
    const pointY = (container.scrollTop + mouseY) / oldScale;

    // 2. 计算新的缩放比例
    const delta = event.deltaY < 0 ? 0.15 : -0.15; // 调整缩放步长
    const newScale = Math.max(0.25, Math.min(2, oldScale + delta));
    
    if (Math.abs(newScale - oldScale) < 0.001) return; // 缩放比例没有变化

    scale.value = newScale;

    // 3. 计算并设置新的滚动位置，以保持内容点在鼠标下
    nextTick(() => {
        // a. 内容点在缩放后的新绝对坐标
        const newPointX = pointX * newScale;
        const newPointY = pointY * newScale;

        // b. 计算新的 scrollLeft/scrollTop
        const newScrollLeft = newPointX - mouseX;
        const newScrollTop = newPointY - mouseY;
        
        container.scrollLeft = newScrollLeft;
        container.scrollTop = newScrollTop;
    });
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
  const viewerElement = document.querySelector('.excel-viewer') as HTMLElement
  if (viewerElement) {
    viewerElement.setAttribute('tabindex', '-1')
    viewerElement.focus()
    viewerElement.addEventListener('keydown', handleKeydown as EventListener)
    viewerElement.addEventListener('wheel', handleWheel as EventListener, { passive: false })
  }

  document.addEventListener('click', handleClickOutside)
  // 默认选择第一个单元格
  selectCell(0, 0)
})

onUnmounted(() => {
  const viewerElement = document.querySelector('.excel-viewer')
  if (viewerElement) {
    viewerElement.removeEventListener('keydown', handleKeydown as EventListener)
    viewerElement.removeEventListener('wheel', handleWheel as EventListener)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.excel-viewer {
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
  background-color: #10b981;
  color: white;
}

.select-text::-moz-selection {
  background-color: #10b981;
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

/* 单元格样式 */
.excel-viewer .w-24 {
  min-width: 80px;
  max-width: 150px;
  width: auto;
}

/* 自适应表格宽度 */
.excel-viewer .bg-white.shadow-lg.rounded-xl {
  min-width: 100%;
  width: max-content;
}

/* 表格容器优化 */
.excel-viewer .overflow-auto {
  overflow-x: auto;
  overflow-y: auto;
}

/* 列宽自适应 */
.excel-viewer .w-24 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 