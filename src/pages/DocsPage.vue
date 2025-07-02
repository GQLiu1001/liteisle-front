<template>
  <div class="min-h-full bg-liteisle-bg p-4 lg:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 详情视图 -->
      <div v-if="docsStore.currentDocument" class="h-[calc(100vh-12rem)] rounded-2xl overflow-hidden">
        <!-- PDF 展示 -->
        <div v-if="docsStore.currentDocument.type === 'pdf'" class="h-full">
          <PDFViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            :file-description="docsStore.currentDocument.summary"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- Word 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'doc' || docsStore.currentDocument.type === 'docx'" class="h-full">
          <WordViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            :file-description="docsStore.currentDocument.summary"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- PowerPoint 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'ppt' || docsStore.currentDocument.type === 'pptx'" class="h-full">
          <PowerPointViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            :file-description="docsStore.currentDocument.summary"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- Excel 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'xls' || docsStore.currentDocument.type === 'xlsx'" class="h-full">
          <ExcelViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            :file-description="docsStore.currentDocument.summary"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- Markdown 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'markdown'" class="h-full">
          <MarkdownViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            :file-description="docsStore.currentDocument.summary"
            :content="docsStore.currentDocument.content"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- 其他格式 -->
        <div v-else class="card flex-1 flex flex-col min-h-0">
          <div class="flex items-center p-4 border-b border-morandi-200 flex-shrink-0">
            <button 
              @click="docsStore.setCurrentDocument(null)" 
              class="flex items-center gap-2 text-morandi-700 hover:text-teal-600 transition-colors"
            >
              <ChevronLeft :size="20" />
              <span class="font-medium">返回列表</span>
            </button>
          </div>
          <div class="p-4 flex-1 overflow-y-auto">
            <div class="h-full flex flex-col">
              <div class="flex items-center justify-between pb-4 border-b border-morandi-200 mb-4 flex-shrink-0">
                <div>
                  <h1 class="text-2xl font-bold text-morandi-900">{{ docsStore.currentDocument.name }}</h1>
                  <p class="text-sm text-morandi-500 mt-1">{{ docsStore.currentDocument.summary }}</p>
                </div>
              </div>
              <div class="flex-1 overflow-y-auto -mr-4 -ml-4 pr-4 pl-4">
                <div class="h-full flex items-center justify-center">
                  <div class="text-center">
                    <FileText :size="64" class="mx-auto text-morandi-400 mb-4" />
                    <p class="text-morandi-600">暂不支持此文件格式的在线预览</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="flex gap-6 h-[calc(100vh-12rem)]">
        <!-- 第一栏：分类导航 -->
        <div class="card w-64 flex-shrink-0 relative">
          <div class="h-full flex flex-col p-4">
            <div class="relative mb-4">
              <input 
                v-model="docsStore.searchQuery"
                placeholder="搜索所有文档..."
                class="w-full px-4 py-2 rounded-lg border border-morandi-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-morandi-900">文档分类</h2>
            </div>
            <nav class="space-y-2 flex-1 overflow-y-auto">
              <button
                v-for="category in docsStore.categoriesWithFilteredCounts"
                :key="category.id"
                @click="docsStore.setCurrentCategory(category.id)"
                :class="[
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200',
                  docsStore.currentCategory === category.id
                    ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                    : 'text-morandi-700 hover:bg-morandi-100 border border-transparent'
                ]"
              >
                <HardDrive :size="20" />
                <div class="flex-1">
                  <div class="font-medium">{{ category.name }}</div>
                  <div class="text-xs text-morandi-500">{{ category.documentCount }} 篇</div>
                </div>
              </button>
            </nav>
          </div>
        </div>

        <!-- 第二栏：文档列表 -->
        <div 
          v-if="docsStore.currentCategory" 
          class="card flex-1 min-w-0 relative"
        >
          <div class="h-full flex flex-col p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-morandi-900 truncate pr-2" :title="docsStore.currentCategoryData?.name || '文档'">
                {{ docsStore.currentCategoryData?.name || '文档' }}
              </h2>
            </div>

            <div class="flex-1 overflow-y-auto -mr-2 pr-2">
              <draggable
                v-if="!docsStore.searchQuery"
                v-model="currentDocsList"
                item-key="id"
                class="space-y-1"
                ghost-class="ghost"
                @start="onDragStart"
              >
                <template #item="{ element: document }">
                  <div
                    @dblclick="docsStore.setCurrentDocument(document)"
                    :data-id="document.id"
                    :class="[
                        'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 group border-2',
                        'border-transparent hover:border-dashed hover:border-teal-300 hover:bg-morandi-50'
                    ]"
                  >
                      <div class="w-4 text-center opacity-30 group-hover:opacity-70 transition-opacity">
                        <div class="w-1 h-4 bg-morandi-400 rounded-full"></div>
                      </div>
                      
                      <div class="flex-shrink-0">
                        <FileText :size="24" :class="getFileIconColor(document.type)" />
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-morandi-900 truncate">{{ document.name }}</h3>
                        <p class="text-sm text-morandi-600 mt-1 line-clamp-2">{{ document.summary }}</p>
                      </div>
                  </div>
                </template>
              </draggable>

              <div v-else class="space-y-1">
                <div
                  v-for="document in docsStore.filteredDocuments"
                  :key="document.id"
                  @dblclick="docsStore.setCurrentDocument(document)"
                  :class="[
                    'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 group border-2',
                    'border-transparent hover:bg-morandi-50'
                  ]"
                >
                  <div class="w-4 text-center opacity-0">
                    <div class="w-1 h-4 bg-morandi-400 rounded-full"></div>
                  </div>
                  <div class="flex-shrink-0">
                    <FileText :size="24" :class="getFileIconColor(document.type)" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-morandi-900 truncate">{{ document.name }}</h3>
                    <p class="text-sm text-morandi-600 mt-1 line-clamp-2">{{ document.summary }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 添加文档对话框 -->
      <div v-if="showAddDocumentDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-bold mb-4">添加文档</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">文档名称</label>
              <input
                v-model="newDocumentName"
                placeholder="请输入文档名称"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">文档类型</label>
              <select
                v-model="newDocumentType"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="markdown">Markdown</option>
                <option value="pdf">PDF</option>
                <option value="doc">Word文档(.doc)</option>
                <option value="docx">Word文档(.docx)</option>
                <option value="ppt">PowerPoint(.ppt)</option>
                <option value="pptx">PowerPoint(.pptx)</option>
                <option value="xls">Excel(.xls)</option>
                <option value="xlsx">Excel(.xlsx)</option>
                <option value="txt">文本</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">摘要</label>
              <textarea
                v-model="newDocumentSummary"
                placeholder="简要描述文档内容"
                rows="3"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showAddDocumentDialog = false"
              class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="addDocument"
              class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      </div>

      <!-- 翻译浮窗 -->
      <div
        v-if="docsStore.showTranslation"
        :style="{ 
          left: docsStore.translationPosition.x + 'px', 
          top: docsStore.translationPosition.y + 'px' 
        }"
        class="fixed bg-white rounded-lg shadow-lg border border-morandi-200 p-4 z-50 max-w-xs"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium text-morandi-700">翻译结果</h4>
          <button
            @click="docsStore.hideTranslationPopup()"
            class="p-1 hover:bg-morandi-100 rounded transition-colors"
          >
            <X :size="16" class="text-morandi-500" />
          </button>
        </div>
        <div class="text-sm text-morandi-600 mb-2">
          原文：{{ docsStore.selectedText }}
        </div>
        <div class="text-sm text-morandi-900">
          {{ docsStore.translationResult }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useDocsStore, type Document } from '../store/DocsStore';
import { useUIStore } from '@/store/UIStore';
import { 
  FileText, 
  X,
  ChevronLeft,
  HardDrive
} from 'lucide-vue-next';
import markdownit from 'markdown-it';
import draggable from 'vuedraggable';
import PDFViewer from '@/components/PDFViewer.vue';
import WordViewer from '@/components/WordViewer.vue';
import PowerPointViewer from '@/components/PowerPointViewer.vue';
import ExcelViewer from '@/components/ExcelViewer.vue';
import MarkdownViewer from '@/components/MarkdownViewer.vue';

const docsStore = useDocsStore();
const uiStore = useUIStore();
const showAddDocumentDialog = ref(false);
const newDocumentName = ref('');
const newDocumentType = ref('markdown');
const newDocumentSummary = ref('');
const draggedItemId = ref<string | null>(null);

watch(() => docsStore.currentDocument, (newDoc) => {
  if (newDoc) {
    uiStore.setSidebarVisible(false);
  } else {
    uiStore.setSidebarVisible(true);
  }
}, { immediate: true }); // Use immediate to run on component mount

onUnmounted(() => {
  // Ensure sidebar is visible when leaving the page
  uiStore.setSidebarVisible(true);
  // Also reset the document state to avoid side-effects
  docsStore.setCurrentDocument(null);
});

const md = markdownit();

const onDragStart = (event: any) => {
  if (event.item) {
    draggedItemId.value = event.item.dataset.id;
  }
};

const currentDocsList = computed({
  get() {
    return docsStore.filteredDocuments;
  },
  set(newDocs: Document[]) {
    if (!draggedItemId.value) return;

    const oldIndex = docsStore.currentCategoryData?.documents.findIndex((d: Document) => d.id === draggedItemId.value);
    const newIndex = newDocs.findIndex((d: Document) => d.id === draggedItemId.value);

    if (oldIndex !== undefined && oldIndex !== -1 && newIndex !== -1) {
      docsStore.reorderDocumentsInCurrentCategory(oldIndex, newIndex);
    }
    
    draggedItemId.value = null;
  }
});

const renderedMarkdown = computed(() => {
  if (!docsStore.currentDocument || docsStore.currentDocument.type !== 'markdown') {
    return ''
  }
  
  // 简单的 Markdown 渲染
  let content = docsStore.currentDocument.content || ''
  
  // 标题渲染
  content = content.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  content = content.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  content = content.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // 代码块渲染
  content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  content = content.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // 列表渲染
  content = content.replace(/^\- (.*$)/gim, '<li>$1</li>')
  content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // 任务列表
  content = content.replace(/- \[ \] (.*)/g, '<input type="checkbox" disabled> $1<br>')
  content = content.replace(/- \[x\] (.*)/g, '<input type="checkbox" checked disabled> $1<br>')
  
  // 段落渲染
  content = content.replace(/\n\n/g, '</p><p>')
  content = '<p>' + content + '</p>'
  
  // 清理空段落
  content = content.replace(/<p><\/p>/g, '')
  content = content.replace(/<p>(<h[1-6]>)/g, '$1')
  content = content.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  content = content.replace(/<p>(<ul>)/g, '$1')
  content = content.replace(/(<\/ul>)<\/p>/g, '$1')
  content = content.replace(/<p>(<pre>)/g, '$1')
  content = content.replace(/(<\/pre>)<\/p>/g, '$1')
  
  return content
})

// 辅助函数
const getFileIconColor = (type: string): string => {
  switch (type) {
    case 'markdown': return 'text-blue-500'
    case 'pdf': return 'text-red-500'
    case 'doc':
    case 'docx': return 'text-indigo-500'
    case 'ppt':
    case 'pptx': return 'text-orange-500'
    case 'xls':
    case 'xlsx': return 'text-green-500'
    case 'txt': return 'text-gray-500'
    default: return 'text-morandi-500'
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// 事件处理
const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    const selectedText = selection.toString().trim()
    if (selectedText.length > 0) {
      docsStore.setSelectedText(selectedText)
      
      // 获取选择区域的位置
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      // 显示翻译浮窗
      docsStore.showTranslationPopup(rect.right + 10, rect.top)
      docsStore.translateText(selectedText)
    }
  }
}

const addDocument = () => {
  if (!newDocumentName.value.trim()) return
  
  const getFileExtension = (type: string) => {
    switch (type) {
      case 'markdown': return '.md'
      case 'pdf': return '.pdf'
      case 'doc': return '.doc'
      case 'docx': return '.docx'
      case 'ppt': return '.ppt'
      case 'pptx': return '.pptx'
      case 'xls': return '.xls'
      case 'xlsx': return '.xlsx'
      case 'txt': return '.txt'
      default: return '.txt'
    }
  }
  
  const newDoc = {
    name: newDocumentName.value + getFileExtension(newDocumentType.value),
    type: newDocumentType.value,
    size: Math.floor(Math.random() * 10485760),
    modifiedAt: new Date(),
    path: `/文档/${docsStore.currentCategoryData?.name}/${newDocumentName.value}`,
    categoryId: docsStore.currentCategory,
    summary: newDocumentSummary.value || '用户添加的文档',
    content: newDocumentType.value === 'markdown' ? '# ' + newDocumentName.value + '\n\n这是一个新文档，请开始编辑内容。' : undefined
  }
  
  docsStore.addDocument(docsStore.currentCategory, newDoc)
  
  // 重置表单
  showAddDocumentDialog.value = false
  newDocumentName.value = ''
  newDocumentType.value = 'markdown'
  newDocumentSummary.value = ''
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Prose 样式优化 */
.prose {
  color: #374151;
  max-width: none;
}

.prose h1 {
  color: #1f2937;
  font-weight: 800;
  font-size: 1.875rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.prose h2 {
  color: #1f2937;
  font-weight: 700;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.prose h3 {
  color: #374151;
  font-weight: 600;
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.prose code {
  background-color: #f3f4f6;
  color: #dc2626;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.prose pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
}

.prose ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.prose input[type="checkbox"] {
  margin-right: 0.5rem;
}

/* 文本选择样式 */
::selection {
  background-color: #bfdbfe;
  color: #1e40af;
}

/* 行号限制 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ghost {
  opacity: 0.5;
  background: #c8ebf9;
}
</style> 