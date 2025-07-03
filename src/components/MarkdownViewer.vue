<template>
  <div class="markdown-viewer w-full h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl overflow-hidden">
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
            <div class="text-gray-500">{{ fileDescription || 'Markdown文档' }} • 按 Ctrl+Shift+C 创建代码块</div>
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
      <!-- 左侧大纲 -->
      <div 
        v-if="isOutlineVisible"
        class="w-64 flex-shrink-0 overflow-y-auto border-r"
      >
        <div class="p-4">
          <OutlineNode 
            v-for="item in nestedOutline" 
            :key="item.id"
            :item="item"
            :collapsed-sections="collapsedSections"
            @toggle="toggleSection"
            @navigate="scrollToHeading"
          />
        </div>
      </div>
      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto p-6" ref="mdContainer" @mouseup="handleTextSelection" @contextmenu.prevent="handleContextMenu">
        <div 
          class="w-full max-w-7xl mx-auto min-h-full pb-24"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
        >
          <EditorContent :editor="editor" class="prose prose-lg max-w-none editor-content"/>
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
          @click.stop="copyText"
        >
          <span>📋 复制{{ translatedText ? '译文' : '' }}</span>
        </button>
        <button 
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="!selectedText || isTranslating"
          @click.stop="translateText"
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
import Heading from '@tiptap/extension-heading'
import { TableOfContents } from '@tiptap/extension-table-of-contents'
import OutlineNode from './OutlineNode.vue'

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
const isOutlineVisible = ref(true)
const collapsedSections = ref<string[]>([])

const flatOutlineItems = ref<any[]>([])

const nestedOutline = computed(() => {
  const toc = flatOutlineItems.value;
  if (!toc.length) return [];
  
  const tree: any[] = [];
  const stack: any[] = [];

  toc.forEach(item => {
    const node = { ...item, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    } else {
      tree.push(node);
    }
    stack.push(node);
  });
  
  return tree;
});

const scrollToHeading = (id: string) => {
  const headingEl = document.getElementById(id);
  if (headingEl) {
    headingEl.scrollIntoView({ behavior: 'smooth' });
  }
}

const toggleSection = (id: string) => {
  const index = collapsedSections.value.indexOf(id);
  if (index > -1) {
    collapsedSections.value.splice(index, 1);
  } else {
    collapsedSections.value.push(id);
  }
};

// 检测文本是否看起来像代码
const isLikelyCode = (text: string): boolean => {
  const codeIndicators = [
    /function\s+\w+\s*\(/,
    /class\s+\w+/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /import\s+.*from/,
    /export\s+(default\s+)?/,
    /if\s*\(.*\)\s*{/,
    /for\s*\(.*\)\s*{/,
    /while\s*\(.*\)\s*{/,
    /{[\s\S]*}/,
    /^\s*\/\/|^\s*\/\*/,
    /<\w+[^>]*>/,
    /\w+\s*:\s*\w+/,
    /;\s*$/m,
  ];
  
  return codeIndicators.some(pattern => pattern.test(text));
};

// 检测编程语言
const detectLanguage = (text: string): string => {
  if (/import.*from|export.*|function\s+\w+|const\s+\w+\s*=/.test(text)) {
    if (/import.*react|jsx|tsx/.test(text)) return 'jsx';
    if (/interface\s+\w+|type\s+\w+\s*=/.test(text)) return 'typescript';
    return 'javascript';
  }
  if (/def\s+\w+|import\s+\w+|print\(/.test(text)) return 'python';
  if (/public\s+class|private\s+\w+|System\.out/.test(text)) return 'java';
  if (/using\s+System|public\s+static\s+void/.test(text)) return 'csharp';
  if (/<\?php|\$\w+/.test(text)) return 'php';
  if (/SELECT\s+.*FROM|INSERT\s+INTO|UPDATE\s+.*SET/i.test(text)) return 'sql';
  if (/<html|<div|<span/.test(text)) return 'html';
  if (/\.\w+\s*{|@media/.test(text)) return 'css';
  if (/{[\s\S]*".*":/.test(text)) return 'json';
  if (/^---$|^\w+:\s*$/m.test(text)) return 'yaml';
  if (/#!/.test(text)) return 'bash';
  
  return '';
};

const toggleOutline = () => {
  isOutlineVisible.value = !isOutlineVisible.value;
};

// --- Tiptap 编辑器核心 ---
const editor = useEditor({
  content: props.content || '',
  extensions: [
    StarterKit,
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    TableOfContents.configure({
      onUpdate(content) {
        flatOutlineItems.value = content;
      },
    }),
    Markdown.configure({
      html: true,
      tightLists: true,
      linkify: true,
      breaks: true,
    }),
  ],
  onCreate: () => {
    console.log('Editor created');
  },
  onUpdate: () => {
    console.log('Editor updated');
  },
  editorProps: {
    attributes: {
      class: 'prose prose-lg max-w-none focus:outline-none',
      spellcheck: 'false',
    },
    handlePaste: (view, event, slice) => {
      // 检查粘贴的内容是否看起来像代码
      const text = event.clipboardData?.getData('text/plain') || '';
      
      // 如果包含多行并且看起来像代码，自动转换为代码块
      if (text.includes('\n') && isLikelyCode(text)) {
        event.preventDefault();
        const { state, dispatch } = view;
        const { tr } = state;
        
        // 插入代码块
        const codeBlockNode = state.schema.nodes.codeBlock.create(
          { language: detectLanguage(text) },
          state.schema.text(text)
        );
        
        dispatch(tr.replaceSelectionWith(codeBlockNode));
        return true;
      }
      
      return false;
    },
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
    // 重置翻译状态
    translatedText.value = ''
    isTranslating.value = false

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
  
  if (isCtrlOrMeta && e.key.toLowerCase() === 'o') {
    e.preventDefault();
    toggleOutline();
    return;
  }

  if (isCtrlOrMeta && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
    e.preventDefault();
    const level = parseInt(e.key) as 1 | 2 | 3 | 4 | 5 | 6;
    editor.value?.chain().focus().toggleHeading({ level }).run();
    return;
  }

  // Ctrl/Cmd + Shift + C 创建代码块
  if (isCtrlOrMeta && e.shiftKey && e.key.toLowerCase() === 'c') {
    e.preventDefault();
    editor.value?.chain().focus().toggleCodeBlock().run();
    return;
  }

  // 物理一行一行跳的上下键逻辑
  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isCtrlOrMeta && !e.shiftKey) {
    const pm = document.querySelector('.ProseMirror') as HTMLElement;
    if (!pm) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let node = range.startContainer as HTMLElement;
    // 找到当前行的block节点
    while (node && node !== pm && node.nodeType === 3 || (node.nodeType === 1 && !(node as HTMLElement).matches('p, pre, li, h1, h2, h3, h4, h5, h6'))) {
      node = node.parentElement as HTMLElement;
    }
    if (!node || node === pm) return;
    // 获取所有block行
    const blocks = Array.from(pm.querySelectorAll('p, pre, li, h1, h2, h3, h4, h5, h6'));
    const idx = blocks.indexOf(node);
    if (idx === -1) return;
    let targetIdx = e.key === 'ArrowUp' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    e.preventDefault();
    const target = blocks[targetIdx];
    // 将光标移到目标行的开头
    const r = document.createRange();
    r.selectNodeContents(target);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    // 让Tiptap同步光标
    editor.value?.commands.focus();
    return;
  }

  // 回车：在当前行后插入新段落
  if (e.key === 'Enter' && !isCtrlOrMeta && !e.shiftKey) {
    const pm = document.querySelector('.ProseMirror') as HTMLElement;
    if (!pm) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let node = range.startContainer as HTMLElement;
    while (node && node !== pm && node.nodeType === 3 || (node.nodeType === 1 && !(node as HTMLElement).matches('p, pre, li, h1, h2, h3, h4, h5, h6'))) {
      node = node.parentElement as HTMLElement;
    }
    if (!node || node === pm) return;
    const blocks = Array.from(pm.querySelectorAll('p, pre, li, h1, h2, h3, h4, h5, h6'));
    const idx = blocks.indexOf(node);
    if (idx === -1) return;
    e.preventDefault();
    // 在当前行后插入新段落
    const pos = editor.value?.view.posAtDOM(node, 0) ?? null;
    const nodeTextLen = (node.textContent || '').length;
    if (pos !== null) {
      editor.value?.chain().focus().insertContentAt(pos + nodeTextLen + 1, { type: 'paragraph' }).run();
      setTimeout(() => {
        const newBlocks = Array.from(pm.querySelectorAll('p, pre, li, h1, h2, h3, h4, h5, h6'));
        if (newBlocks[idx + 1]) {
          const r = document.createRange();
          r.selectNodeContents(newBlocks[idx + 1]);
          r.collapse(true);
          const sel2 = window.getSelection();
          if (sel2) {
            sel2.removeAllRanges();
            sel2.addRange(r);
          }
          editor.value?.commands.focus();
        }
      }, 0);
    }
    return;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown);
  mdContainer.value?.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('click', handleClickOutside);

  // 点击页面其他位置隐藏右键菜单
  const hide = () => { showContextMenu.value = false }
  document.addEventListener('click', hide)
  onUnmounted(() => document.removeEventListener('click', hide))
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown);
  mdContainer.value?.removeEventListener('wheel', handleWheel);
  document.removeEventListener('click', handleClickOutside);
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
  font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 20px 24px;
  border-radius: 8px;
  margin: 20px 0;
  overflow-x: auto;
  min-height: 80px;
  background: #f8f9fa !important;
  border: none;
  box-shadow: none;
}

.prose pre code {
  background: none;
  color: #212529;
  font-size: 14px;
  font-weight: 400;
  padding: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: 1.6;
  min-height: 28px;
  display: block;
  letter-spacing: 0.025em;
}

.hljs-comment,
.hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.hljs-variable,
.hljs-template-variable,
.hljs-attr {
  color: #e36209;
}

.hljs-tag,
.hljs-name,
.hljs-selector-id,
.hljs-selector-class {
  color: #d73a49;
}

.hljs-regexp,
.hljs-meta {
  color: #e36209;
}

.hljs-number,
.hljs-literal {
  color: #005cc5;
}

.hljs-built_in,
.hljs-type,
.hljs-params {
  color: #005cc5;
}

.hljs-link {
  color: #0366d6;
}

.hljs-attribute {
  color: #6f42c1;
}

.hljs-string,
.hljs-symbol,
.hljs-bullet,
.hljs-addition {
  color: #032f62;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-section {
  color: #d73a49;
  font-weight: 500;
}

.hljs-title,
.hljs-emphasis {
  color: #6f42c1;
  font-weight: 600;
}

.hljs-strong {
  font-weight: bold;
  color: #032f62;
}

.hljs-function {
  color: #6f42c1;
}

.hljs-class {
  color: #e36209;
}

/* 特定语法高亮增强 */
.hljs-annotation {
  color: #d73a49;
}

.hljs-doctag {
  color: #d73a49;
}

.hljs-property {
  color: #005cc5;
}

/* 操作符和标点 */
.hljs-operator {
  color: #d73a49;
}

.hljs-punctuation {
  color: #212529;
}

/* 访问修饰符 */
.hljs-keyword.hljs-public,
.hljs-keyword.hljs-private,
.hljs-keyword.hljs-protected,
.hljs-keyword.hljs-final {
  color: #d73a49;
  font-weight: 500;
}

.prose .code-lang {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: #6e7781;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
}

.prose :not(pre) > code,
.prose .inline-code-element {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  padding: 2px 6px;
  margin: 0 1px;
  font-size: 0.9em;
  background-color: #f3f4f6;
  color: #e53e3e;
  border-radius: 3px;
  border: none;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* 确保内联代码没有伪元素 */
.prose :not(pre) > code::before,
.prose :not(pre) > code::after,
.prose .inline-code-element::before,
.prose .inline-code-element::after {
  content: none !important;
}

/* 修复Tiptap编辑器中的内联代码显示 */
.ProseMirror code {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  padding: 2px 6px;
  margin: 0 1px;
  font-size: 0.9em;
  background-color: #f3f4f6;
  color: #e53e3e;
  border-radius: 3px;
  border: none;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
}

.ProseMirror code::before,
.ProseMirror code::after {
  content: none !important;
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

/* 确保编辑器内容可选择 */
.ProseMirror {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* 编辑器内容样式 */
.editor-content .ProseMirror {
  min-height: 200px;
  padding: 2rem;
  line-height: 1.7;
}

.editor-content .ProseMirror p {
  margin: 1rem 0;
  line-height: 1.7;
}

/* 标题样式优化 */
.editor-content .ProseMirror h1 {
  margin: 2rem 0 1rem 0;
}

.editor-content .ProseMirror h2 {
  margin: 1.8rem 0 0.8rem 0;
}

.editor-content .ProseMirror h3 {
  margin: 1.5rem 0 0.6rem 0;
}

/* 空状态提示 */
.editor-content .ProseMirror:empty::before {
  content: "开始编写您的文档...";
  color: #9ca3af;
  font-style: italic;
  pointer-events: none;
  position: absolute;
  top: 2rem;
  left: 2rem;
}

/* 空代码块提示 */
.ProseMirror [data-type="codeBlock"] code:empty::before {
  content: "// 在此输入代码...";
  color: #6c757d;
  font-style: italic;
  pointer-events: none;
  opacity: 0.7;
}

/* 代码块选择样式 */
.ProseMirror [data-type="codeBlock"] code::selection {
  background: rgba(3, 102, 214, 0.2);
}

.ProseMirror [data-type="codeBlock"] code::-moz-selection {
  background: rgba(3, 102, 214, 0.2);
}

/* 修复可能的Markdown标记显示问题 */
.ProseMirror .ProseMirror-trailingBreak {
  display: none;
}

/* 确保代码元素在编辑时不显示额外的标记 */
.ProseMirror [data-type="codeBlock"] {
  position: relative;
}

.ProseMirror [data-type="codeBlock"]::before,
.ProseMirror [data-type="codeBlock"]::after {
  content: none !important;
}

/* 代码块编辑区域样式 */
.ProseMirror [data-type="codeBlock"] {
  margin: 20px 0;
}

.ProseMirror [data-type="codeBlock"] pre {
  background: #f8f9fa !important;
  border-radius: 8px;
  padding: 20px 24px;
  min-height: 80px;
  overflow-x: auto;
  position: relative;
  border: none;
  box-shadow: none;
}

.ProseMirror [data-type="codeBlock"] code {
  color: #212529 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 1.6 !important;
  min-height: 28px;
  display: block;
  white-space: pre;
  outline: none;
  border: none;
  background: transparent;
  resize: none;
  font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  letter-spacing: 0.025em;
}

/* 确保代码块内的光标可见 */
.ProseMirror [data-type="codeBlock"] code:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

/* Node view wrapper 样式 */
.code-block-wrapper {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: none;
  box-shadow: none;
  transition: all 0.2s ease;
}

.code-block-wrapper:hover {
  background: #f8f9fa;
}

.code-block-wrapper:focus-within {
  background: #f8f9fa;
}

.code-block-wrapper pre {
  margin: 0;
  padding: 20px 24px;
  min-height: 80px;
  background: #f8f9fa;
  border-radius: 8px;
}

.code-block-wrapper code {
  color: #212529;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  white-space: pre;
  font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  min-height: 28px;
  display: block;
  letter-spacing: 0.025em;
}
</style>