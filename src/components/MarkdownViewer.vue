<template>
  <div class="markdown-viewer h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl overflow-hidden">
    <!-- 顶部工具栏 -->
    <div class="flex-shrink-0 border-b p-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button 
          class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
          @click="$emit('close')"
        >
          <ChevronLeftIcon class="w-5 h-5" />
          <span>返回列表</span>
        </button>
        <div class="h-6 w-px bg-gray-200"></div>
        <div class="text-sm text-gray-600">
          <div class="font-medium text-gray-900">{{ fileName }}</div>
          <div class="text-gray-500">{{ fileDescription || 'Markdown文档' }}</div>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <button 
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="zoomOut"
        >
          <MinusIcon class="w-5 h-5" />
        </button>
        <span class="text-sm text-gray-600">{{ Math.round(scale * 100) }}%</span>
        <button 
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="zoomIn"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧大纲 -->
      <div 
        class="w-64 flex-shrink-0 overflow-y-auto border-r"
        :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
      >
        <div class="p-4">
          <div v-for="(item, index) in visibleOutline" :key="index" class="outline-item">
            <div 
              :class="[
                'flex items-center cursor-pointer rounded-lg py-1.5 px-2 transition-colors',
                { 
                  'text-blue-600 bg-blue-50': activeHeading === item.id,
                  'hover:bg-gray-50': activeHeading !== item.id
                }
              ]"
              :style="{ paddingLeft: `${(item.level * 12) + 8}px` }"
              @click="scrollToHeading(item.id)"
            >
              <span 
                v-if="item.hasChildren" 
                class="mr-2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
                @click.stop="toggleSection(item.id)"
              >
                {{ expandedSections.includes(item.id) ? '▼' : '▶' }}
              </span>
              <span class="truncate text-sm">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto p-6" ref="mdContainer">
        <div 
          class="w-full max-w-[900px] mx-auto min-h-full pb-24"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
        >
          <div 
            class="px-8 py-6 text-gray-800 leading-relaxed select-text prose prose-lg max-w-none"
            v-html="renderedMarkdown"
            @mouseup="handleTextSelection"
            @contextmenu="handleContextMenu"
          />
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-if="showContextMenu" 
      class="fixed bg-white shadow-lg rounded-lg overflow-hidden border"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <div class="py-1">
        <button 
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          :disabled="!selectedText || isTranslating"
          @click="translateText"
        >
          <span>翻译选中文本</span>
          <span v-if="isTranslating" class="text-blue-600">翻译中...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ChevronLeftIcon from 'lucide-vue-next/dist/esm/icons/chevron-left'
import PlusIcon from 'lucide-vue-next/dist/esm/icons/plus'
import MinusIcon from 'lucide-vue-next/dist/esm/icons/minus'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import anchor from 'markdown-it-anchor'

// 使用更适合的代码高亮主题
import 'highlight.js/styles/github.css'

// 导入 markdown-it 插件
import taskLists from 'markdown-it-task-lists'
import { full as emoji } from 'markdown-it-emoji'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import footnote from 'markdown-it-footnote'

interface Props {
  filePath: string
  fileName: string
  fileDescription?: string
  content?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const scale = ref(1)
const mdContainer = ref<HTMLElement | null>(null)
const selectedText = ref('')
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const translatedText = ref('')
const isTranslating = ref(false)

const outline = ref<OutlineItem[]>([])
const activeHeading = ref<string>('')
const expandedSections = ref<string[]>([])

interface OutlineItem {
  id: string
  text: string
  level: number
  hasChildren: boolean
  parentId?: string
}

// 解析 Markdown 内容生成大纲
const parseOutline = (content: string) => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const items: OutlineItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/\s+/g, '-')
    
    const item: OutlineItem = {
      id,
      text,
      level,
      hasChildren: false
    }

    // 找到父节点
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].level < level) {
        item.parentId = items[i].id
        items[i].hasChildren = true
        break
      }
    }
    
    items.push(item)
  }

  return items
}

// 计算可见的大纲项
const visibleOutline = computed(() => {
  return outline.value.filter(item => {
    if (!item.parentId) return true
    
    // 检查所有父节点是否展开
    let currentItem = item
    while (currentItem.parentId) {
      const parent = outline.value.find(p => p.id === currentItem.parentId)
      if (!parent || !expandedSections.value.includes(parent.id)) {
        return false
      }
      currentItem = parent
    }
    return true
  })
})

// 切换章节展开/折叠
const toggleSection = (id: string) => {
  const index = expandedSections.value.indexOf(id)
  if (index === -1) {
    expandedSections.value.push(id)
  } else {
    expandedSections.value.splice(index, 1)
  }
}

// 监听内容变化，更新大纲
watch(() => props.content, (newContent) => {
  if (newContent) {
    outline.value = parseOutline(newContent)
    // 默认展开所有节点
    expandedSections.value = outline.value
      .filter(item => item.hasChildren)
      .map(item => item.id)
  }
}, { immediate: true })

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeHeading.value = id
  }
}

// 监听滚动，高亮当前标题
const handleScroll = () => {
  const headings = document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6')
  const scrollPosition = mdContainer.value?.scrollTop || 0

  for (const heading of headings) {
    const id = heading.getAttribute('id')
    if (id && heading.getBoundingClientRect().top <= 100) {
      activeHeading.value = id
    }
  }
}

// 修改 markdown-it 配置，为标题添加 id
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: (code: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
        return `<pre class="relative"><code class="hljs language-${lang}">${highlighted}</code><span class="code-lang">${lang}</span></pre>`
      } catch (__) {}
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  }
}).use(anchor, {
  permalink: false,
  slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-')
})

// 添加 markdown-it 插件
md.use(taskLists)  // 支持任务列表
  .use(emoji)      // 支持 emoji
  .use(sub)        // 支持下标
  .use(sup)        // 支持上标
  .use(footnote)   // 支持脚注

const renderedMarkdown = computed(() => {
  return md.render(props.content || '')
})

// --- 下面的代码都是你原来写的，它们是正确的，无需改动 ---

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
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim()
    contextMenuX.value = e.clientX
    contextMenuY.value = e.clientY
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
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey) {
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
    }
  }
}
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
  mdContainer.value?.addEventListener('wheel', handleWheel, { passive: false })
  document.addEventListener('click', handleClickOutside)
  mdContainer.value?.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  mdContainer.value?.removeEventListener('wheel', handleWheel)
  document.removeEventListener('click', handleClickOutside)
  mdContainer.value?.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* 基础样式 */
.markdown-viewer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 选择文本样式 */
.select-text {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.select-text::selection {
  background-color: #2563eb;
  color: white;
}

/* 滚动条样式 */
.overflow-auto::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track,
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover,
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Markdown 样式 */
.prose {
  font-size: 15px;
  line-height: 1.6;
  color: #24292f;
  background-color: white;
}

.prose h1 {
  font-size: 2em;
  margin-top: 2em;
  margin-bottom: 1em;
  font-weight: 600;
  line-height: 1.25;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.prose h2 {
  font-size: 1.5em;
  margin-top: 1.75em;
  margin-bottom: 0.75em;
  font-weight: 600;
  line-height: 1.25;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.prose h3 {
  font-size: 1.25em;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  line-height: 1.25;
}

.prose p {
  margin: 1em 0;
  line-height: 1.6;
}

.prose pre {
  position: relative;
  background-color: #f6f8fa;
  border-radius: 0.5rem;
  padding: 16px;
  margin: 1.5rem 0;
  overflow-x: auto;
  font-size: 85%;
  line-height: 1.45;
}

.prose pre code {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: 0;
  white-space: pre;
  font-size: inherit;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
}

.prose .code-lang {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: #6e7781;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
}

.prose :not(pre) > code {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 0.25rem;
}

.prose ul, .prose ol {
  padding-left: 2em;
  margin: 1em 0;
}

.prose li {
  margin: 0.25em 0;
}

.prose blockquote {
  margin: 1em 0;
  padding: 0 1em;
  color: #57606a;
  border-left: 0.25em solid #d0d7de;
  border-radius: 0.25rem;
}

.prose hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #d0d7de;
  border: 0;
}

.prose table {
  display: block;
  width: 100%;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin: 1em 0;
  border-spacing: 0;
  border-collapse: collapse;
}

.prose table th,
.prose table td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}

.prose table tr {
  background-color: #ffffff;
  border-top: 1px solid #d0d7de;
}

.prose table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

/* 大纲样式 */
.outline-item {
  color: #24292f;
}

.outline-item .cursor-pointer {
  transition: all 0.2s;
}

/* 展开/折叠图标样式 */
.outline-item .mr-2 {
  font-size: 10px;
  transition: transform 0.2s;
}

.outline-item .mr-2:hover {
  transform: scale(1.2);
}

/* 标题锚点样式 */
.prose h1[id],
.prose h2[id],
.prose h3[id],
.prose h4[id],
.prose h5[id],
.prose h6[id] {
  scroll-margin-top: 5rem;
}

/* 内容区域样式 */
.prose {
  background-color: white;
}

.prose pre {
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.prose code {
  border-radius: 0.25rem;
}

.prose img {
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
}

.prose blockquote {
  border-radius: 0.25rem;
}
</style>