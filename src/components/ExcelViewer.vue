<template>
  <div class="excel-viewer h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl overflow-hidden">
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
        class="bg-white shadow-lg rounded-xl inline-block min-w-full"
        :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, Minus, Plus, Maximize } from 'lucide-vue-next'

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

const sheetData = ref({
  sheet1: [
    ['项目名称', '开始日期', '结束日期', '负责人', '状态', '进度', '预算', '实际费用', '备注', '优先级', '风险等级', '完成度', '团队规模', '技术栈', '客户', '地区', '类型', '版本', '更新时间', '备注2'],
    ['网站重构', '2024-01-01', '2024-03-31', '张三', '进行中', '75%', '100000', '75000', '按计划进行', '高', '低', '75%', '5人', 'Vue.js', '客户A', '北京', 'Web', 'v1.0', '2024-01-15', '前端重构'],
    ['移动应用', '2024-02-15', '2024-06-30', '李四', '计划中', '10%', '150000', '15000', '需求分析阶段', '中', '中', '10%', '8人', 'React Native', '客户B', '上海', 'Mobile', 'v0.1', '2024-02-20', 'iOS/Android'],
    ['数据平台', '2024-01-15', '2024-05-15', '王五', '进行中', '60%', '200000', '120000', '开发阶段', '高', '高', '60%', '12人', 'Python/Django', '客户C', '深圳', 'Platform', 'v2.0', '2024-03-01', '大数据分析'],
    ['用户系统', '2024-03-01', '2024-07-31', '赵六', '计划中', '5%', '80000', '4000', '技术选型', '中', '低', '5%', '4人', 'Node.js', '客户D', '广州', 'System', 'v1.0', '2024-03-05', '用户管理'],
    ['API网关', '2024-01-10', '2024-04-10', '钱七', '进行中', '85%', '120000', '102000', '测试阶段', '高', '中', '85%', '6人', 'Spring Boot', '客户E', '杭州', 'Gateway', 'v1.5', '2024-03-20', '微服务架构'],
    ['监控系统', '2024-02-01', '2024-05-31', '孙八', '进行中', '40%', '90000', '36000', '设计阶段', '中', '低', '40%', '3人', 'Grafana', '客户F', '成都', 'Monitor', 'v0.8', '2024-02-25', '实时监控'],
    ['电商平台', '2024-03-15', '2024-08-15', '周九', '计划中', '0%', '300000', '0', '项目启动', '高', '高', '0%', '15人', 'Microservices', '客户G', '武汉', 'E-commerce', 'v1.0', '2024-03-15', '在线购物'],
    ['AI助手', '2024-04-01', '2024-09-30', '吴十', '计划中', '0%', '250000', '0', '需求收集', '高', '中', '0%', '10人', 'Python/TensorFlow', '客户H', '南京', 'AI', 'v0.1', '2024-04-01', '智能客服'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['总计', '', '', '', '', '', '1290000', '352000', '', '', '', '', '63人', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ],
  sheet2: [
    ['月份', '销售额', '成本', '利润', '增长率', '客户数', '订单数', '平均订单', '退款率', '客户满意度', '市场份额', '广告支出', '转化率', '复购率', '新客户', '老客户', '移动端', 'PC端', '其他渠道', '备注'],
    ['1月', '50000', '30000', '20000', '15%', '120', '450', '111', '2%', '4.2', '12%', '8000', '3.2%', '45%', '80', '40', '60%', '35%', '5%', '春节影响'],
    ['2月', '55000', '32000', '23000', '15%', '135', '520', '106', '1.8%', '4.3', '13%', '9000', '3.5%', '48%', '90', '45', '62%', '33%', '5%', '情人节促销'],
    ['3月', '48000', '29000', '19000', '-5%', '115', '410', '117', '2.2%', '4.1', '11%', '7500', '3.0%', '42%', '70', '45', '58%', '37%', '5%', '淡季'],
    ['4月', '62000', '35000', '27000', '42%', '150', '580', '107', '1.5%', '4.4', '14%', '10000', '3.8%', '52%', '100', '50', '65%', '30%', '5%', '春季促销'],
    ['5月', '58000', '33000', '25000', '-7%', '140', '540', '107', '1.9%', '4.2', '13%', '9500', '3.6%', '49%', '85', '55', '63%', '32%', '5%', '五一假期'],
    ['6月', '65000', '37000', '28000', '12%', '165', '620', '105', '1.6%', '4.5', '15%', '11000', '4.0%', '55%', '110', '55', '67%', '28%', '5%', '618促销'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['平均', '56333', '32667', '23667', '12%', '138', '520', '109', '1.8%', '4.3', '13%', '9167', '3.5%', '49%', '89', '48', '63%', '32%', '5%', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ],
  sheet3: [
    ['图表类型', '数据源', '创建日期', '说明', '更新频率', '负责人', '用途', '状态', '查看次数', '分享次数', '最后查看', '文件大小', '格式', '权限', '标签', '分类', '版本', '备注', '关联项目', '优先级'],
    ['柱状图', '销售数据', '2024-01-15', '月度销售对比', '每日', '张三', '管理报告', '活跃', '156', '23', '2024-03-20', '2.3MB', 'PNG', '公开', '销售', '报表', 'v1.2', '关键指标', '网站重构', '高'],
    ['饼图', '成本分析', '2024-01-20', '成本构成分析', '每周', '李四', '财务分析', '活跃', '89', '12', '2024-03-18', '1.8MB', 'SVG', '内部', '成本', '分析', 'v1.0', '成本优化', '数据平台', '中'],
    ['折线图', '趋势分析', '2024-01-25', '销售趋势', '每月', '王五', '预测分析', '活跃', '234', '45', '2024-03-22', '3.1MB', 'PDF', '限制', '趋势', '预测', 'v2.0', '趋势预测', 'AI助手', '高'],
    ['散点图', '用户行为', '2024-02-01', '用户活跃度', '实时', '赵六', '产品优化', '活跃', '78', '8', '2024-03-19', '1.5MB', 'JPEG', '内部', '用户', '行为', 'v1.1', '用户画像', '用户系统', '中'],
    ['热力图', '地域分布', '2024-02-10', '销售地域分析', '每日', '钱七', '市场分析', '活跃', '123', '19', '2024-03-21', '2.8MB', 'PNG', '公开', '地域', '分布', 'v1.3', '市场扩展', '电商平台', '高'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ]
})

// 计算属性
const currentSheetData = computed(() => {
  return sheetData.value[currentSheet.value as keyof typeof sheetData.value] || []
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
    scale.value = Math.min(2, scale.value + 0.25)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25)
  }
}

const fitToWindow = () => {
  scale.value = 1
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
  // 默认选择第一个单元格
  selectCell(0, 0)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('wheel', handleWheel)
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