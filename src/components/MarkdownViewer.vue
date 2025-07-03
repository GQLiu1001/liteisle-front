<template>
  <div class="markdown-viewer w-full h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg">
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

        <!-- 主内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 编辑器容器 -->
      <div class="flex-1 overflow-hidden">
        <div ref="vditorElement" class="h-full"></div>
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

// DOM 引用
const vditorElement = ref<HTMLElement>()

// Vditor 实例
let vditor: Vditor | null = null

// 初始化 Vditor
const initVditor = async () => {
  if (!vditorElement.value) return

  try {
    vditor = new Vditor(vditorElement.value, {
      height: '100%',
      mode: 'ir', // 即时渲染模式
      value: currentContent.value,
      placeholder: '开始编写 Markdown...',
      theme: 'classic',
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
          engine: 'KaTeX'
        },
        markdown: {
          codeBlockPreview: false, // 禁用代码块预览
          mathBlockPreview: false, // 禁用数学公式预览
        }
      },
      toolbar: [], // 完全隐藏工具栏
      counter: {
        enable: false
      },
      cache: {
        enable: false
      },
      outline: {
        enable: true, // 启用官方大纲
        position: 'left'
      },
      tab: '\t', // 设置 Tab 键行为
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
        console.log('Vditor 初始化完成')
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
        }, 100)
      },
      hint: {
        emojiPath: 'https://unpkg.com/vditor/dist/images/emoji'
      }
    })
    } catch (error) {
    console.error('Vditor 初始化失败:', error)
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

// 键盘快捷键
const handleGlobalKeydown = (e: KeyboardEvent) => {
  const isCtrlOrMeta = e.ctrlKey || e.metaKey

  // Ctrl/Cmd + S 保存
  if (isCtrlOrMeta && e.key.toLowerCase() === 's') {
    e.preventDefault()
    saveContent()
    return
  }
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

// 生命周期
onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)
  await nextTick()
  await initVditor()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  vditor?.destroy()
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

/* 强制编辑器背景为白色 */
:deep(.vditor) {
  background-color: white !important;
}

:deep(.vditor-content) {
  background-color: white !important;
}

:deep(.vditor-ir) {
  background-color: white !important;
}

:deep(.vditor-ir .vditor-reset) {
  background-color: white !important;
}

:deep(.vditor-ir:focus) {
  background-color: white !important;
}

:deep(.vditor-ir:focus .vditor-reset) {
  background-color: white !important;
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