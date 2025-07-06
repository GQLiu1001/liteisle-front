<template>
  <div class="markdown-viewer w-full h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl overflow-hidden">
    <!-- 顶部工具栏 -->
    <div class="flex-shrink-0 border-b p-4 flex items-center justify-between bg-gray-50">
      <div class="flex items-center space-x-4">
        <button 
          @click="$emit('close')"
          class="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>返回</span>
        </button>
        
        <div class="flex items-center space-x-2">
          <div class="text-lg font-semibold text-gray-800">{{ title || 'Markdown 编辑器' }}</div>
          </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- 缩放指示器 -->
        <div class="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg">
          <span class="text-sm">{{ Math.round(zoomLevel * 100) }}%</span>
          <button 
            @click="resetZoom"
            class="text-xs hover:text-gray-800 transition-colors"
            title="重置缩放 (Ctrl+0)"
          >
            重置
          </button>
        </div>

        <!-- 快捷键提示按钮 -->
        <button 
          @click="showShortcuts = !showShortcuts"
          class="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="快捷键提示"
        >
          <span class="text-sm">?</span>
          <span>快捷键</span>
        </button>

        <!-- 隐藏大纲按钮 -->
        <button 
          @click="toggleOutline"
          class="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          :title="showOutline ? '隐藏大纲' : '显示大纲'"
        >
          <span>{{ showOutline ? '隐藏大纲' : '显示大纲' }}</span>
        </button>

        <!-- 保存按钮 -->
        <button 
          @click="saveContent"
          class="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="保存 (Ctrl+S)"
        >
          <CheckIcon class="w-4 h-4" />
          <span>保存</span>
        </button>
      </div>
    </div>

    <!-- 快捷键提示弹窗 -->
    <div v-if="showShortcuts" class="absolute top-16 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-50">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-gray-800">快捷键</h3>
        <button @click="showShortcuts = false" class="text-gray-500 hover:text-gray-700">
          <span class="text-xl">×</span>
        </button>
      </div>
      
      <div class="space-y-2 text-sm">
        <div class="grid grid-cols-2 gap-2">
          <div class="font-medium text-gray-700">标题:</div>
          <div class="text-gray-600">Ctrl+1-6</div>
          
          <div class="font-medium text-gray-700">粗体:</div>
          <div class="text-gray-600">Ctrl+B</div>
          
          <div class="font-medium text-gray-700">斜体:</div>
          <div class="text-gray-600">Ctrl+I</div>
          
          <div class="font-medium text-gray-700">下划线:</div>
          <div class="text-gray-600">Ctrl+U</div>
          
          <div class="font-medium text-gray-700">行内代码:</div>
          <div class="text-gray-600">Ctrl+`</div>
          
          <div class="font-medium text-gray-700">代码块:</div>
          <div class="text-gray-600">Ctrl+Shift+`</div>
          
          <div class="font-medium text-gray-700">链接:</div>
          <div class="text-gray-600">Ctrl+K</div>
          
          <div class="font-medium text-gray-700">列表:</div>
          <div class="text-gray-600">Ctrl+L</div>
          
          <div class="font-medium text-gray-700">表格:</div>
          <div class="text-gray-600">Ctrl+E</div>
          
          <div class="font-medium text-gray-700">分割线:</div>
          <div class="text-gray-600">Ctrl+D</div>
          
          <div class="font-medium text-gray-700">引用:</div>
          <div class="text-gray-600">Ctrl+Q</div>
          
          <div class="font-medium text-gray-700">保存:</div>
          <div class="text-gray-600">Ctrl+S</div>
          
          <div class="font-medium text-gray-700">缩放:</div>
          <div class="text-gray-600">Ctrl+滚轮</div>
          
          <div class="font-medium text-gray-700">重置缩放:</div>
          <div class="text-gray-600">Ctrl+0</div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex overflow-hidden" @contextmenu="handleContextMenu">
      <!-- 编辑器容器 -->
      <div class="flex-1 overflow-hidden">
        <div ref="vditorElement" class="h-full w-full"></div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
// Icon imports
import CheckIcon from 'lucide-vue-next/dist/esm/icons/check'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useVditorStore } from '@/store/VditorStore'

// 组件属性
interface Props {
  content: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  title: ''
})

const emit = defineEmits<{
  close: []
  save: [content: string]
  'update:content': [content: string]
}>()

// 状态管理
const currentContent = ref(props.content || '')
const zoomLevel = ref(1) // 添加缩放级别状态
const showShortcuts = ref(false) // 添加快捷键提示状态
const showOutline = ref(true) // 大纲显示状态

// DOM 引用
const vditorElement = ref<HTMLElement>()

// Vditor 实例和Store
let vditor: Vditor | null = null
const vditorStore = useVditorStore()

// 右键菜单相关状态
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')
const translatedText = ref('')
const isTranslating = ref(false)

// 初始化 Vditor
const initVditor = async () => {
  if (!vditorElement.value) return

  try {
    // 使用全局VditorStore创建实例，确保依赖已预加载
    vditor = await vditorStore.createVditorInstance(vditorElement.value, {
      height: '100%',
      mode: 'ir', // 即时渲染模式 - 类似 Typora 的优雅编辑方式
      value: currentContent.value,
      placeholder: '开始编写 Markdown...',
      theme: 'classic',
      typewriterMode: false, // 打字机模式，可选启用
      preview: {
        theme: {
          current: 'light',
          path: 'https://unpkg.com/vditor/dist/css/content-theme'
        },
        hljs: {
          enable: true,
          style: 'github',
          lineNumber: false
        },
        math: {
          engine: 'KaTeX',
          inlineDigit: false
        },
        markdown: {
          codeBlockPreview: false, // 禁用代码块预览以避免点击时的弹窗问题
          mathBlockPreview: true, // 启用数学公式预览
          autoSpace: true, // 自动在中西文之间添加空格
          fixTermTypo: true, // 自动矫正术语
          toc: true, // 支持目录
          footnotes: true, // 支持脚注
          paragraphBeginningSpace: false, // 段落开头不自动空格
          listStyle: false, // 不为列表添加样式
          linkBase: '',
          linkPrefix: '',
          mark: true // 支持标记高亮
        }
      },
      toolbar: [], // 完全隐藏工具栏以获得纯净的 IR 体验
      counter: {
        enable: false
      },
      cache: {
        enable: false
      },
      outline: {
        enable: showOutline.value, // 启用大纲以增强文档结构感
        position: 'left'
      },
      tab: '\t', // 设置 Tab 键行为
      // IR 模式特有的优化
      hint: {
        delay: 200, // 快速提示
        emoji: {
          '+1': '👍',
          '-1': '👎', 
          'heart': '❤️',
          'smile': '😊',
          'laughing': '😆',
          'blush': '😊',
          'smiley': '😃',
          'relaxed': '😌',
          'smirk': '😏',
          'heart_eyes': '😍',
          'kissing_heart': '😘',
          'kissing_closed_eyes': '😚',
          'flushed': '😳',
          'relieved': '😌',
          'satisfied': '😆',
          'grin': '😁',
          'wink': '😉',
          'stuck_out_tongue_winking_eye': '😜',
          'stuck_out_tongue_closed_eyes': '😝',
          'grinning': '😀',
          'kissing': '😗',
          'kissing_smiling_eyes': '😙',
          'stuck_out_tongue': '😛',
          'sleeping': '😴',
          'worried': '😟',
          'frowning': '😦',
          'anguished': '😧',
          'open_mouth': '😮',
          'grimacing': '😬',
          'confused': '😕',
          'hushed': '😯',
          'expressionless': '😑',
          'unamused': '😒',
          'sweat_smile': '😅',
          'sweat': '😓',
          'disappointed_relieved': '😥',
          'weary': '😩',
          'pensive': '😔',
          'disappointed': '😞',
          'confounded': '😖',
          'fearful': '😨',
          'cold_sweat': '😰',
          'persevere': '😣',
          'cry': '😢',
          'sob': '😭',
          'joy': '😂',
          'astonished': '😲',
          'scream': '😱'
        },
        emojiPath: 'https://unpkg.com/vditor/dist/images/emoji'
      },
      // 自定义快捷键
      keydown: (event: KeyboardEvent) => {
        // 检查是否在表格中按回车
        if (event.key === 'Enter' && !event.shiftKey) {
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const element = range.startContainer.nodeType === Node.TEXT_NODE 
              ? range.startContainer.parentElement 
              : range.startContainer as Element
            
            // 查找是否在表格单元格内
            const cell = element?.closest('td, th')
            if (cell) {
              const table = cell.closest('table')
              if (table) {
                event.preventDefault()
                
                // 找到当前行
                const currentRow = cell.closest('tr')
                const allRows = Array.from(table.querySelectorAll('tr'))
                const currentRowIndex = allRows.indexOf(currentRow as HTMLTableRowElement)
                
                // 如果是最后一行，添加新行
                if (currentRowIndex === allRows.length - 1) {
                  const newRow = (currentRow as HTMLTableRowElement).cloneNode(true) as HTMLTableRowElement
                  // 清空新行的内容
                  newRow.querySelectorAll('td, th').forEach(cell => {
                    cell.textContent = ''
                  })
                  table.appendChild(newRow)
                  
                  // 将光标移动到新行的第一个单元格
                  const firstCell = newRow.querySelector('td, th') as HTMLElement
                  if (firstCell) {
                    firstCell.focus()
                    const range = document.createRange()
                    range.selectNodeContents(firstCell)
                    range.collapse(true)
                    selection.removeAllRanges()
                    selection.addRange(range)
                  }
                  return false
                }
              }
            }
          }
        }
        return true
      },
      input: (value: string) => {
        currentContent.value = value
        emit('update:content', value)
      },
      after: () => {
        console.log('Vditor IR 模式初始化完成 - 享受类似 Typora 的优雅编辑体验')
        // 设置编辑器背景
        setTimeout(() => {
          const setWhiteBackground = () => {
            const elements = document.querySelectorAll('.vditor-content, .vditor-ir, .vditor-ir .vditor-reset')
            elements.forEach((el: any) => {
              if (el instanceof HTMLElement) {
                el.style.backgroundColor = 'white'
                el.style.setProperty('background-color', 'white', 'important')
              }
            })
          }
          
          setWhiteBackground()
          // 定期检查并设置背景
          const interval = setInterval(setWhiteBackground, 500)
          setTimeout(() => clearInterval(interval), 5000)
          
          // 在 Vditor 初始化完成后添加滚轮事件监听
          if (vditorElement.value) {
            // 监听整个编辑器区域的滚轮事件
            const vditorIr = vditorElement.value.querySelector('.vditor-ir') as HTMLElement
            const vditorContent = vditorElement.value.querySelector('.vditor-content') as HTMLElement
            
            const targetElement = vditorIr || vditorContent
            if (targetElement) {
              targetElement.addEventListener('wheel', handleZoom, { passive: false })
            }
          }
        }, 100)
      }
    })
  } catch (error) {
    console.error('Vditor IR 模式初始化失败:', error)
  }
}

// 保存内容
const saveContent = () => {
  if (vditor) {
    const content = vditor.getValue()
    currentContent.value = content
    emit('save', content)
    emit('update:content', content)
  }
}

// 切换大纲显示状态
const toggleOutline = () => {
  showOutline.value = !showOutline.value
  
  // 重新初始化 Vditor 以应用大纲设置
  if (vditor) {
    vditor.destroy()
    nextTick(() => {
      initVditor()
    })
  }
}

// 缩放功能
const handleZoom = (event: WheelEvent) => {
  // 检查是否按下 Ctrl 键
  if (event.ctrlKey) {
    event.preventDefault()
    
    // 根据滚轮方向调整缩放级别
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newZoomLevel = Math.max(0.5, Math.min(3, zoomLevel.value + delta))
    
    zoomLevel.value = newZoomLevel
    
    // 应用缩放到编辑器内容区域（不包括大纲）
    if (vditorElement.value) {
      // 查找编辑器的主要内容区域
      const vditorIr = vditorElement.value.querySelector('.vditor-ir .vditor-reset') as HTMLElement
      const vditorContent = vditorElement.value.querySelector('.vditor-content .vditor-reset') as HTMLElement
      
      // 应用缩放到找到的内容区域
      const targetElement = vditorIr || vditorContent
      if (targetElement) {
        targetElement.style.fontSize = `${newZoomLevel}rem`
        targetElement.style.lineHeight = '1.6'
      }
    }
  }
}

// 重置缩放
const resetZoom = () => {
  zoomLevel.value = 1
  if (vditorElement.value) {
    // 重置编辑器内容区域的缩放
    const vditorIr = vditorElement.value.querySelector('.vditor-ir .vditor-reset') as HTMLElement
    const vditorContent = vditorElement.value.querySelector('.vditor-content .vditor-reset') as HTMLElement
    
    const targetElement = vditorIr || vditorContent
    if (targetElement) {
      targetElement.style.fontSize = '1rem'
      targetElement.style.lineHeight = '1.6'
    }
  }
}

// 键盘快捷键
const handleGlobalKeydown = (e: KeyboardEvent) => {
  const isCtrlOrMeta = e.ctrlKey || e.metaKey

  // Ctrl/Cmd + S 保存
  if (isCtrlOrMeta && e.key.toLowerCase() === 's') {
    e.preventDefault()
    saveContent()
    return
  }
  
  // Ctrl/Cmd + 0 重置缩放
  if (isCtrlOrMeta && e.key === '0') {
    e.preventDefault()
    resetZoom()
    return
  }

  // 只有编辑器获得焦点时才处理 Markdown 格式化快捷键
  if (!vditor) return

  // Ctrl/Cmd + 1-6 设置标题
  if (isCtrlOrMeta && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
    e.preventDefault()
    const level = parseInt(e.key)
    insertHeading(level)
    return
  }

  // Ctrl/Cmd + B 粗体
  if (isCtrlOrMeta && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    toggleBold()
    return
  }

  // Ctrl/Cmd + I 斜体
  if (isCtrlOrMeta && e.key.toLowerCase() === 'i') {
    e.preventDefault()
    toggleItalic()
    return
  }

  // Ctrl/Cmd + U 下划线
  if (isCtrlOrMeta && e.key.toLowerCase() === 'u') {
    e.preventDefault()
    toggleUnderline()
    return
  }

  // Ctrl/Cmd + K 插入链接
  if (isCtrlOrMeta && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    insertLink()
    return
  }

  // Ctrl/Cmd + ` 插入行内代码
  if (isCtrlOrMeta && e.key === '`') {
    e.preventDefault()
    toggleInlineCode()
    return
  }

  // Ctrl/Cmd + Shift + ` 插入代码块
  if (isCtrlOrMeta && e.shiftKey && e.key === '`') {
    e.preventDefault()
    insertCodeBlock()
    return
  }

  // Ctrl/Cmd + L 插入列表
  if (isCtrlOrMeta && e.key.toLowerCase() === 'l') {
    e.preventDefault()
    insertList()
    return
  }

  // Ctrl/Cmd + E 插入表格
  if (isCtrlOrMeta && e.key.toLowerCase() === 'e') {
    e.preventDefault()
    insertTable()
    return
  }

  // Ctrl/Cmd + D 插入分割线
  if (isCtrlOrMeta && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    insertDivider()
    return
  }

  // Ctrl/Cmd + Q 插入引用
  if (isCtrlOrMeta && e.key.toLowerCase() === 'q') {
    e.preventDefault()
    insertQuote()
    return
  }
}

// 使用 Vditor 官方 API 的快捷键功能函数
const insertHeading = (level: number) => {
  if (!vditor) return
  
  // 获取当前选中的文本
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 如果有选中文本，将选中文本转换为标题
    const cleanText = selectedText.replace(/^(#{1,6})\s*/, '').trim() || '标题文本'
    const headingText = '#'.repeat(level) + ' ' + cleanText
    ;(vditor as any).deleteValue()
    vditor.insertValue(headingText)
  } else {
    // 如果没有选中文本，操作当前行
    // 使用插入标记的方法来定位光标位置
    const marker = '||CURSOR_MARKER||'
    
    // 在光标位置插入标记
    vditor.insertValue(marker)
    
    // 获取包含标记的内容
    const contentWithMarker = vditor.getValue()
    
    // 找到标记的位置
    const markerIndex = contentWithMarker.indexOf(marker)
    
    if (markerIndex !== -1) {
      // 分析标记所在的行
      const lines = contentWithMarker.split('\n')
      let currentLineIndex = 0
      let charCount = 0
      
      // 找到包含标记的行
      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= markerIndex) {
          currentLineIndex = i
          break
        }
        charCount += lines[i].length + 1 // +1 for newline
      }
      
      // 获取当前行（移除标记）
      const currentLine = lines[currentLineIndex].replace(marker, '')
      
      // 移除现有标题标记
      const headerRegex = /^(#{1,6})\s*/
      const cleanLine = currentLine.replace(headerRegex, '').trim() || '标题文本'
      
      // 创建新的标题文本
      const newHeaderText = '#'.repeat(level) + ' ' + cleanLine
      
      // 替换当前行
      lines[currentLineIndex] = newHeaderText
      
      // 更新编辑器内容（移除标记）
      const newContent = lines.join('\n')
      vditor.setValue(newContent)
    } else {
      // 如果找不到标记，移除标记并使用备用方案
      const cleanContent = contentWithMarker.replace(marker, '')
      const headingText = '#'.repeat(level) + ' 标题文本'
      vditor.setValue(cleanContent)
      vditor.insertValue(headingText)
    }
  }
  
  // 重新聚焦编辑器
  setTimeout(() => {
    vditor?.focus()
  }, 50)
}

const toggleBold = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 检查是否已经是粗体格式
    if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
      // 移除粗体格式
      const cleanText = selectedText.slice(2, -2)
      ;(vditor as any).deleteValue()
      vditor.insertValue(cleanText)
    } else {
      // 添加粗体格式
      const boldText = `**${selectedText}**`
      ;(vditor as any).deleteValue()
      vditor.insertValue(boldText)
    }
  } else {
    // 没有选中文本，插入粗体模板
    vditor.insertValue('**粗体文本**')
  }
}

const toggleItalic = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 检查是否已经是斜体格式
    if (selectedText.startsWith('*') && selectedText.endsWith('*') && !selectedText.startsWith('**')) {
      // 移除斜体格式
      const cleanText = selectedText.slice(1, -1)
      ;(vditor as any).deleteValue()
      vditor.insertValue(cleanText)
    } else {
      // 添加斜体格式
      const italicText = `*${selectedText}*`
      ;(vditor as any).deleteValue()
      vditor.insertValue(italicText)
    }
  } else {
    // 没有选中文本，插入斜体模板
    vditor.insertValue('*斜体文本*')
  }
}

const toggleUnderline = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 检查是否已经是下划线格式
    if (selectedText.startsWith('<u>') && selectedText.endsWith('</u>')) {
      // 移除下划线格式
      const cleanText = selectedText.slice(3, -4)
      ;(vditor as any).deleteValue()
      vditor.insertValue(cleanText)
    } else {
      // 添加下划线格式
      const underlineText = `<u>${selectedText}</u>`
      ;(vditor as any).deleteValue()
      vditor.insertValue(underlineText)
    }
  } else {
    // 没有选中文本，插入下划线模板
    vditor.insertValue('<u>下划线文本</u>')
  }
}

const toggleInlineCode = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 检查是否已经是行内代码格式
    if (selectedText.startsWith('`') && selectedText.endsWith('`')) {
      // 移除行内代码格式
      const cleanText = selectedText.slice(1, -1)
      ;(vditor as any).deleteValue()
      vditor.insertValue(cleanText)
    } else {
      // 添加行内代码格式
      const codeText = `\`${selectedText}\``
      ;(vditor as any).deleteValue()
      vditor.insertValue(codeText)
    }
  } else {
    // 没有选中文本，插入行内代码模板
    vditor.insertValue('`行内代码`')
  }
}

const insertCodeBlock = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 将选中文本包装为代码块
    const codeBlock = `\n\`\`\`\n${selectedText}\n\`\`\`\n`
    ;(vditor as any).deleteValue()
    vditor.insertValue(codeBlock)
  } else {
    // 没有选中文本，插入代码块模板
    vditor.insertValue('\n```\n代码块\n```\n')
  }
}

const insertLink = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 将选中文本作为链接文本
    const linkText = `[${selectedText}](URL)`
    ;(vditor as any).deleteValue()
    vditor.insertValue(linkText)
  } else {
    // 没有选中文本，插入链接模板
    vditor.insertValue('[链接文本](URL)')
  }
}

const insertList = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 将选中文本转为列表项
    const lines = selectedText.split('\n')
    const listText = lines.map((line: string) => line.trim() ? `- ${line.trim()}` : '').join('\n')
    ;(vditor as any).deleteValue()
    vditor.insertValue(listText)
  } else {
    // 没有选中文本，插入列表模板
    vditor.insertValue('\n- 列表项1\n- 列表项2\n- 列表项3\n')
  }
}

const insertTable = () => {
  if (!vditor) return
  
  const tableText = '\n| 标题1 | 标题2 | 标题3 |\n|-------|-------|-------|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n'
  vditor.insertValue(tableText)
}

const insertDivider = () => {
  if (!vditor) return
  
  const dividerText = '\n---\n'
  vditor.insertValue(dividerText)
}

const insertQuote = () => {
  if (!vditor) return
  
  const selectedText = (vditor as any).getSelection()
  
  if (selectedText) {
    // 将选中文本转为引用
    const lines = selectedText.split('\n')
    const quoteText = lines.map((line: string) => line.trim() ? `> ${line.trim()}` : '>').join('\n')
    ;(vditor as any).deleteValue()
    vditor.insertValue(quoteText)
  } else {
    // 没有选中文本，插入引用模板
    vditor.insertValue('> 引用文本')
  }
}

// 辅助函数：获取选中的文本
const getSelectedText = (): string => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    return selection.toString()
  }
  return ''
}

// 监听 props 变化
watch(() => props.content, (newContent) => {
  if (newContent && newContent !== currentContent.value) {
    currentContent.value = newContent
    
    if (vditor) {
      vditor.setValue(newContent)
    }
  }
}, { immediate: true })

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

// 生命周期
onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)
  await nextTick()
  await initVditor()
  
  // 添加滚轮事件监听
  if (vditorElement.value) {
    vditorElement.value.addEventListener('wheel', handleZoom, { passive: false })
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (vditorElement.value) {
    vditorElement.value.removeEventListener('wheel', handleZoom)
    // 清理内容区域的事件监听器
    const vditorIr = vditorElement.value.querySelector('.vditor-ir') as HTMLElement
    const vditorContent = vditorElement.value.querySelector('.vditor-content') as HTMLElement
    
    const targetElement = vditorIr || vditorContent
    if (targetElement) {
      targetElement.removeEventListener('wheel', handleZoom)
    }
  }
  vditor?.destroy()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 隐藏 Vditor 的提示和工具栏 */
:deep(.vditor-tip) {
  display: none !important;
}

:deep(.vditor-hint) {
  display: none !important;
}

:deep(.vditor-counter) {
  display: none !important;
}

/* 强制隐藏工具栏 */
:deep(.vditor-toolbar) {
  display: none !important;
}

:deep(.vditor-toolbar--hide) {
  display: none !important;
}

/* 隐藏代码块预览弹窗 */
:deep(.vditor-hint--emoji) {
  display: none !important;
}

:deep(.vditor-hint) {
  display: none !important;
}

:deep(.vditor-tooltipped) {
  display: none !important;
}

:deep(.vditor-panel) {
  display: none !important;
}

:deep(.vditor-panel--none) {
  display: none !important;
}

/* 确保编辑器内容区域占80%宽度，左右留空 */
:deep(.vditor) {
  background-color: white !important;
  border: none !important;
  width: 100% !important;
  max-width: none !important;
}

:deep(.vditor-content) {
  background-color: white !important;
  width: 100% !important;
  max-width: none !important;
}

:deep(.vditor-ir) {
  background-color: white !important;
  width: 100% !important;
  max-width: none !important;
  padding: 0 !important;
}

:deep(.vditor-ir .vditor-reset) {
  background-color: white !important;
  width: 80% !important;
  max-width: none !important;
  margin: 0 auto !important;
  padding: 2rem !important;
  border: none !important;
}

/* 工具栏样式 */
:deep(.vditor-toolbar) {
  border: none !important;
  background-color: #f9fafb !important;
}

/* 大纲栏边框 */
:deep(.vditor-outline) {
  border-right: 1px solid #e5e7eb !important;
  background-color: #f9fafb !important;
}

:deep(.vditor-content .vditor-reset) {
  width: 80% !important;
  max-width: none !important;
  margin: 0 auto !important;
  padding: 2rem !important;
  border: none !important;
}

/* 自定义滚动条样式 */
:deep(.vditor-ir),
:deep(.vditor-content),
:deep(.vditor-preview) {
  /* WebKit浏览器滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

:deep(.vditor-ir::-webkit-scrollbar),
:deep(.vditor-content::-webkit-scrollbar),
:deep(.vditor-preview::-webkit-scrollbar) {
  width: 8px;
}

:deep(.vditor-ir::-webkit-scrollbar-track),
:deep(.vditor-content::-webkit-scrollbar-track),
:deep(.vditor-preview::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.vditor-ir::-webkit-scrollbar-thumb),
:deep(.vditor-content::-webkit-scrollbar-thumb),
:deep(.vditor-preview::-webkit-scrollbar-thumb) {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

:deep(.vditor-ir::-webkit-scrollbar-thumb:hover),
:deep(.vditor-content::-webkit-scrollbar-thumb:hover),
:deep(.vditor-preview::-webkit-scrollbar-thumb:hover) {
  background: rgba(156, 163, 175, 0.5);
  background-clip: content-box;
}

:deep(.vditor-ir::-webkit-scrollbar-corner),
:deep(.vditor-content::-webkit-scrollbar-corner),
:deep(.vditor-preview::-webkit-scrollbar-corner) {
  background: transparent;
}

/* 在不同屏幕尺寸下优化内容布局 */
@media (min-width: 768px) {
  :deep(.vditor-ir .vditor-reset) {
    padding: 2rem 3rem !important;
  }
  
  :deep(.vditor-content .vditor-reset) {
    padding: 2rem 3rem !important;
  }
}

@media (min-width: 1024px) {
  :deep(.vditor-ir .vditor-reset) {
    padding: 2rem 4rem !important;
  }
  
  :deep(.vditor-content .vditor-reset) {
    padding: 2rem 4rem !important;
  }
}

@media (min-width: 1280px) {
  :deep(.vditor-ir .vditor-reset) {
    padding: 2rem 5rem !important;
  }
  
  :deep(.vditor-content .vditor-reset) {
    padding: 2rem 5rem !important;
  }
}

/* 移除其他区域的边框 */
:deep(.vditor-content),
:deep(.vditor-ir),
:deep(.vditor-preview) {
  border: none !important;
}

/* 确保编辑器占满整个容器 */
.markdown-viewer :deep(.vditor) {
  height: 100% !important;
  width: 100% !important;
}

/* 自定义 div 样式 */
:deep(.info) {
  background: #e7f3ff;
  border-left: 4px solid #2196f3;
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 4px;
}

:deep(.warning) {
  background: #fff8e1;
  border-left: 4px solid #ff9800;
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 4px;
}

:deep(.error) {
  background: #ffebee;
  border-left: 4px solid #f44336;
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 4px;
}

:deep(.success) {
  background: #e8f5e8;
  border-left: 4px solid #4caf50;
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 4px;
}

/* 代码块语言标签 */
:deep(.code-language-tag) {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-family: monospace;
  z-index: 10;
}

/* 代码块样式 */
:deep(pre) {
  position: relative;
  background: #f6f8fa !important;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
}

:deep(pre code) {
  background: #f6f8fa !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
}

/* 行内代码样式 */
:deep(code) {
  background: #f1f3f4 !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', Consolas, monospace !important;
  font-size: 0.9em !important;
}

/* 确保代码块内的代码有背景 */
:deep(.vditor-ir .vditor-reset pre code),
:deep(.vditor-ir .vditor-reset code) {
  background: #f6f8fa !important;
}

:deep(.vditor-ir .vditor-reset code:not(pre code)) {
  background: #f1f3f4 !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
}

/* 确保大纲视图不受缩放影响 */
:deep(.vditor-outline) {
  font-size: 14px !important;
}

:deep(.vditor-outline .vditor-outline__item) {
  font-size: 14px !important;
}

:deep(.vditor-outline .vditor-outline__title) {
  font-size: 14px !important;
}

/* 列表样式 */
:deep(ul), :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

:deep(li) {
  margin: 0.25em 0;
}

:deep(ul ul), :deep(ol ol), :deep(ul ol), :deep(ol ul) {
  margin: 0.25em 0;
}
</style>