<template>
  <div class="markdown-viewer w-full h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl overflow-hidden">
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
        <!-- 撤销/重做按钮 -->
        <button 
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-50"
          @click="undo"
          :disabled="!canUndo"
        >
          <UndoIcon class="w-5 h-5" />
        </button>
        <button 
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-50"
          @click="redo"
          :disabled="!canRedo"
        >
          <RedoIcon class="w-5 h-5" />
        </button>
        <div class="h-6 w-px bg-gray-200"></div>
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
        <div class="h-6 w-px bg-gray-200"></div>
        <button 
          class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-blue-600 hover:text-blue-700"
          @click="toggleEdit"
        >
          <PencilIcon class="w-5 h-5" />
          <span>保存</span>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto p-6" ref="mdContainer">
        <div 
          class="w-full max-w-7xl mx-auto min-h-full pb-24"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
        >
          <EditorContent :editor="editor" class="prose prose-lg max-w-none"/>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-if="showContextMenu" 
      class="fixed bg-white shadow-lg rounded-lg overflow-hidden border z-50"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <div class="py-1">
        <button 
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="!selectedText"
          @click="copyText"
        >
          <span>📋 复制{{ translatedText ? '译文' : '' }}</span>
        </button>
        <button 
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="!selectedText || isTranslating"
          @click="translateText"
        >
          <span>🌐 翻译</span>
          <span v-if="isTranslating" class="text-blue-600">翻译中...</span>
        </button>
      </div>

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
import { ref, computed, onMounted, onUnmounted, watch, onBeforeUnmount } from 'vue'
import ChevronLeftIcon from 'lucide-vue-next/dist/esm/icons/chevron-left'
import PlusIcon from 'lucide-vue-next/dist/esm/icons/plus'
import MinusIcon from 'lucide-vue-next/dist/esm/icons/minus'
import PencilIcon from 'lucide-vue-next/dist/esm/icons/pencil'
import UndoIcon from 'lucide-vue-next/dist/esm/icons/undo'
import RedoIcon from 'lucide-vue-next/dist/esm/icons/redo'

// 导入 Tiptap 相关
import { useEditor, EditorContent, VueNodeViewRenderer } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import CodeBlockComponent from './CodeBlockComponent.vue'

// 导入 highlight.js 语言和样式
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';
import html from 'highlight.js/lib/languages/xml'; // 'html' is an alias for 'xml'
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/atom-one-light.css';

const lowlight = createLowlight()

// 注册语言
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('csharp', csharp);
lowlight.register('php', php);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('sql', sql);
lowlight.register('json', json);
lowlight.register('yaml', yaml);
lowlight.register('markdown', markdown);
lowlight.register('bash', bash);

interface Props {
  filePath: string
  fileName: string
  fileDescription?: string
  content?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [content: string]
}>()

const scale = ref(1)
const mdContainer = ref<HTMLElement | null>(null)
const selectedText = ref('')
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const translatedText = ref('')
const isTranslating = ref(false)

const handleScroll = () => {
    // Scroll handling for active heading can be improved or simplified
}

// --- Tiptap 编辑器核心 ---
const editor = useEditor({
  content: props.content || '',
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      codeBlock: false, // 禁用默认的 codeBlock
    }),
    Markdown.configure({
      html: true,
      tightLists: true,
      linkify: true,
      breaks: true,
    }),
    CodeBlockLowlight
      .extend({
        addNodeView() {
          return VueNodeViewRenderer(CodeBlockComponent)
        },
      })
      .configure({ lowlight }),
  ],
  onCreate: () => {
  },
  onUpdate: () => {
  },
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const saveContent = () => {
  if (!editor.value) return;
  const markdownContent = editor.value.storage.markdown.getMarkdown();
  emit('save', markdownContent);
};

const toggleEdit = () => {
  saveContent();
};

watch(() => props.content, (newContent) => {
  const contentToSet = newContent || '';
  if (editor.value && contentToSet !== editor.value.storage.markdown.getMarkdown()) {
    editor.value.commands.setContent(contentToSet, false);
  }
}, { immediate: true });

const undo = () => editor.value?.chain().focus().undo().run();
const redo = () => editor.value?.chain().focus().redo().run();
const canUndo = computed(() => editor.value?.can().undo() ?? false);
const canRedo = computed(() => editor.value?.can().redo() ?? false);

const zoomIn = () => scale.value = Math.min(2, scale.value + 0.1)
const zoomOut = () => scale.value = Math.max(0.5, scale.value - 0.1)

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
      translatedText.value = `翻译结果: ${selectedText.value}`
    } catch (error) {
      translatedText.value = '翻译失败，请重试'
    } finally {
      isTranslating.value = false
    }
  }
}

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) {
    event.preventDefault()
    if (event.deltaY < 0) zoomIn()
    else zoomOut()
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

const handleGlobalKeydown = (e: KeyboardEvent) => {
  const isCtrlOrMeta = e.ctrlKey || e.metaKey;

  if (isCtrlOrMeta && e.key.toLowerCase() === 's') {
    e.preventDefault();
    saveContent();
    return;
  }

  if (isCtrlOrMeta && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
    e.preventDefault();
    const level = parseInt(e.key) as 1 | 2 | 3 | 4 | 5 | 6;
    editor.value?.chain().focus().toggleHeading({ level }).run();
    return;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown);
  mdContainer.value?.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('click', handleClickOutside);
  mdContainer.value?.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown);
  mdContainer.value?.removeEventListener('wheel', handleWheel);
  document.removeEventListener('click', handleClickOutside);
  mdContainer.value?.removeEventListener('scroll', handleScroll);
});
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
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  padding: 1rem;
  border-radius: 6px;
  margin: 1.5em 0;
  overflow-x: auto;
}

.prose pre code {
  background: none;
  color: inherit;
  font-size: 1em;
  padding: 0;
  white-space: pre;
  word-wrap: normal;
}

.hljs-comment,
.hljs-quote {
  color: #8b949e;
}

.hljs-variable,
.hljs-template-variable,
.hljs-tag,
.hljs-name,
.hljs-selector-id,
.hljs-selector-class,
.hljs-regexp,
.hljs-meta {
  color: #ff7b72;
}

.hljs-number,
.hljs-built_in,
.hljs-literal,
.hljs-type,
.hljs-params,
.hljs-link {
  color: #79c0ff;
}

.hljs-attribute {
  color: #a5d6ff;
}

.hljs-string,
.hljs-symbol,
.hljs-bullet,
.hljs-addition {
  color: #a5d6ff;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-section {
  color: #ff7b72;
}

.hljs-title,
.hljs-emphasis {
  color: #d2a8ff;
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
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

/* Tiptap Editor focus outline removal */
.ProseMirror:focus {
  outline: none;
}
</style>