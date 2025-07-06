<template>
  <div class="min-h-screen bg-liteisle-bg p-4 lg:p-6 select-none">
    <div class="mx-auto h-full">
      <!-- 详情视图 -->
      <div v-if="docsStore.currentDocument" class="h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] rounded-2xl overflow-hidden">
        <!-- PDF 展示 -->
        <div v-if="docsStore.currentDocument.type === 'pdf'" class="h-full">
          <PDFViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- Word 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'doc' || docsStore.currentDocument.type === 'docx'" class="h-full">
          <WordViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- PowerPoint 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'ppt' || docsStore.currentDocument.type === 'pptx'" class="h-full">
          <PowerPointViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- Excel 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'xls' || docsStore.currentDocument.type === 'xlsx'" class="h-full">
          <ExcelViewer 
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            @close="docsStore.setCurrentDocument(null)"
          />
        </div>

        <!-- Markdown 展示 -->
        <div v-else-if="docsStore.currentDocument.type === 'markdown'" class="h-full">
          <MarkdownViewer 
            :key="docsStore.currentDocument.path"
            :file-path="docsStore.currentDocument.path || ''"
            :file-name="docsStore.currentDocument.name"
            v-model:content="docsStore.currentDocument.content"
            @close="docsStore.setCurrentDocument(null)"
            @save="docsStore.saveDocumentContent"
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
      <div v-else class="max-w-7xl mx-auto">
        <div class="flex gap-6  h-[calc(100vh-12rem)] lg: h-[calc(100vh-12rem)]">
          <!-- 第一栏：分类导航 -->
          <div class="card w-64 flex-shrink-0 relative">
            <div class="h-full flex flex-col p-4">
              <div class="relative mb-4">
                <input 
                  v-model="docsStore.searchQuery"
                  placeholder="搜索所有文档..."
                  class="w-full px-4 py-2 rounded-lg border border-morandi-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent select-text"
                  style="user-select: text !important;"
                />
              </div>
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-morandi-900">文档分类</h2>
                <button
                  @click="showCreateCategoryDialog = true"
                  class="flex items-center gap-1 px-2 py-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-sm"
                  title="添加分类"
                >
                  <svg :size="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  添加分类
                </button>
              </div>
              <nav class="space-y-2 flex-1 overflow-y-auto">
                <draggable
                  v-model="currentCategoriesList"
                  item-key="id"
                  class="space-y-2"
                  :animation="150"
                  ghost-class="ghost"
                  chosen-class="chosen"
                  drag-class="drag"
                  @end="onCategoryDragEnd"
                  :force-fallback="false"
                  :disabled="false"
                >
                  <template #item="{ element: category }">
                    <button
                      @click="docsStore.setCurrentCategory(category.id)"
                      @contextmenu.prevent="handleCategoryContextMenu($event, category)"
                      :class="[
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 cursor-pointer',
                        docsStore.currentCategory === category.id
                          ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                          : 'text-morandi-700 hover:bg-morandi-100 border border-transparent'
                      ]"
                    >
                      <BookImage :size="20" />
                      <div class="flex-1">
                        <div class="font-medium">{{ category.name }}</div>
                        <div class="text-xs text-morandi-500">{{ category.documentCount }} 篇</div>
                      </div>
                    </button>
                  </template>
                </draggable>
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
                <div v-if="docsStore.currentCategory" class="flex items-center gap-2">
                  <button
                    @click="showUploadDocumentDialog = true"
                    class="flex items-center gap-1 px-2 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors text-sm"
                    title="上传文档"
                  >
                    <Upload :size="16" />
                    上传文档
                  </button>
                  <button
                    @click="showAddMarkdownDialog = true"
                    class="flex items-center gap-1 px-2 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors text-sm"
                    title="新建Markdown文档"
                  > 
                    <Plus :size="16" />
                    新建MD
                  </button>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto -mr-2 pr-2">
                <draggable
                  v-if="!docsStore.searchQuery"
                  v-model="currentDocsList"
                  item-key="id"
                  class="space-y-1"
                  :animation="150"
                  ghost-class="ghost"
                  chosen-class="chosen"
                  drag-class="drag"
                  @start="onDragStart"
                  @end="onDocumentDragEnd"
                  :force-fallback="false"
                  :disabled="false"
                >
                  <template #item="{ element: document }">
                    <div
                      @dblclick="docsStore.setCurrentDocument(document)"
                      @contextmenu.prevent="showDocumentContextMenu($event, document)"
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
                        </div>
                    </div>
                  </template>
                </draggable>

                <div v-else class="space-y-1">
                  <div
                    v-for="document in docsStore.filteredDocuments"
                    :key="document.id"
                    @dblclick="docsStore.setCurrentDocument(document)"
                    @contextmenu.prevent="showDocumentContextMenu($event, document)"
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
                    </div>
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
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 select-text"
                style="user-select: text !important;"
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
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 select-text"
                style="user-select: text !important;"
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

      <!-- 创建分类对话框 -->
      <div v-if="showCreateCategoryDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-bold mb-4">新建文档分类</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">分类名称</label>
              <input
                v-model="newCategoryName"
                type="text"
                placeholder="请输入分类名称"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 select-text"
                @keydown.enter="createNewCategory"
                style="user-select: text !important;"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showCreateCategoryDialog = false"
              class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="createNewCategory"
              :disabled="!newCategoryName.trim()"
              class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建
            </button>
          </div>
        </div>
      </div>

      <!-- 上传文档对话框 -->
      <div v-if="showUploadDocumentDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-bold mb-4">上传文档</h3>
          <div class="space-y-4">
            <div class="border-2 border-dashed border-morandi-300 rounded-lg p-8 text-center">
              <FileText :size="32" class="mx-auto mb-3 text-morandi-400" />
              <p class="text-morandi-600 mb-2">点击选择文档文件或拖拽到此处</p>
              <p class="text-xs text-morandi-400">支持 PDF、Word、PowerPoint、Excel、文本等格式</p>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md"
                class="hidden" 
                ref="documentFileInput"
                @change="handleDocumentFileSelect"
              />
              <button 
                @click="() => documentFileInput?.click()"
                class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                选择文档文件
              </button>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showUploadDocumentDialog = false; selectedDocumentFiles = []"
              class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="uploadDocumentFiles"
              :disabled="selectedDocumentFiles.length === 0"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上传 ({{ selectedDocumentFiles.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- 新建Markdown文档对话框 -->
      <div v-if="showAddMarkdownDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-bold mb-4">新建Markdown文档</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">文档名称</label>
              <input
                v-model="newDocumentName"
                type="text"
                placeholder="请输入文档名称"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 select-text"
                @keydown.enter="createMarkdownDocument"
                style="user-select: text !important;"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">文档摘要</label>
              <textarea
                v-model="newDocumentSummary"
                placeholder="简要描述文档内容（可选）"
                rows="3"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 select-text"
                style="user-select: text !important;"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showAddMarkdownDialog = false"
              class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="createMarkdownDocument"
              :disabled="!newDocumentName.trim()"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建
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
                  <div class="text-sm text-morandi-600 mb-2 select-text">
          原文：{{ docsStore.selectedText }}
        </div>
        <div class="text-sm text-morandi-900 select-text">
          {{ docsStore.translationResult }}
        </div>
      </div>

      <!-- 重命名文档对话框 -->
      <div v-if="showRenameDocDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="cancelRenameDocument">
        <div class="bg-white rounded-lg p-6 w-96" @click.stop>
          <h3 class="text-lg font-bold mb-4">重命名文档</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-morandi-700 mb-2">新名称</label>
              <input
                ref="renameDocInput"
                v-model="renameDocValue"
                type="text"
                placeholder="请输入新名称"
                class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 select-text"
                @keydown.enter="confirmRenameDocument"
                @keydown.esc="cancelRenameDocument"
                style="user-select: text !important;"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="cancelRenameDocument"
              class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmRenameDocument"
              :disabled="!renameDocValue.trim()"
              class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 重命名分类对话框 -->
  <div v-if="showRenameCategoryDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="cancelRenameCategory">
    <div class="bg-white rounded-lg p-6 w-96" @click.stop>
      <h3 class="text-lg font-bold mb-4">重命名分类</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-morandi-700 mb-2">新名称</label>
          <input
            ref="renameCategoryInput"
            v-model="renameCategoryValue"
            type="text"
            placeholder="请输入新名称"
            class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 select-text"
            @keydown.enter="confirmRenameCategory"
            @keydown.esc="cancelRenameCategory"
            style="user-select: text !important;"
          />
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="cancelRenameCategory"
          class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          @click="confirmRenameCategory"
          :disabled="!renameCategoryValue.trim()"
          class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted, nextTick } from 'vue';
import { useDocsStore, type Document, type DocumentCategory } from '../store/DocsStore';
import { useTransferStore } from '../store/TransferStore';
import { useUIStore } from '@/store/UIStore';
import { useContextMenuStore, type ContextMenuItem } from '@/store/ContextMenuStore';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { 
  Upload,
  FileText, 
  X,
  Plus,
  ChevronLeft,
  BookImage
} from 'lucide-vue-next';
import draggable from 'vuedraggable';
import PDFViewer from '@/components/PDFViewer.vue';
import WordViewer from '@/components/WordViewer.vue';
import PowerPointViewer from '@/components/PowerPointViewer.vue';
import ExcelViewer from '@/components/ExcelViewer.vue';
import MarkdownViewer from '@/components/MarkdownViewer.vue';

const docsStore = useDocsStore();
const transferStore = useTransferStore();
const uiStore = useUIStore();
const contextMenuStore = useContextMenuStore();
const toast = useToast();
const route = useRoute();
const showAddDocumentDialog = ref(false);
const showUploadDocumentDialog = ref(false);
const showAddMarkdownDialog = ref(false);
const showCreateCategoryDialog = ref(false);
const newDocumentName = ref('');
const newDocumentType = ref('markdown');
const newDocumentSummary = ref('');
const newCategoryName = ref('');
const selectedDocumentFiles = ref<File[]>([]);
const documentFileInput = ref<HTMLInputElement | null>(null);
const draggedItemId = ref<string | null>(null);

// 右键菜单相关
const selectedDocument = ref<Document | null>(null);
const selectedCategory = ref<DocumentCategory | null>(null);

// 重命名相关
const showRenameDocDialog = ref(false);
const renameDocValue = ref('');
const renameDocInput = ref<HTMLInputElement | null>(null);

// 分类重命名相关
const showRenameCategoryDialog = ref(false);
const renameCategoryValue = ref('');
const renameCategoryInput = ref<HTMLInputElement | null>(null);

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

onMounted(() => {
  docsStore.loadCategoriesFromDrive()
  const { path } = route.query
  if (path && typeof path === 'string') {
    docsStore.loadDocumentByPath(path)
  }
})

const onDragStart = (event: any) => {
  if (event.item) {
    draggedItemId.value = event.item.dataset.id;
  }
};

// 分类拖动结束事件
const onCategoryDragEnd = (event: {oldIndex: number, newIndex: number}) => {
  if (event.oldIndex !== event.newIndex) {
    docsStore.reorderCategories(event.oldIndex, event.newIndex);
  }
};

// 文档拖动结束事件
const onDocumentDragEnd = (event: {oldIndex: number, newIndex: number}) => {
  if (event.oldIndex !== event.newIndex) {
    docsStore.reorderDocumentsInCurrentCategory(event.oldIndex, event.newIndex);
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

// 可拖动的分类列表
const currentCategoriesList = computed({
  get() {
    return docsStore.categoriesWithFilteredCounts;
  },
  set(newCategories: DocumentCategory[]) {
    docsStore.reorderCategories(newCategories);
  }
});

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

// 创建新分类的方法
const createNewCategory = () => {
  const categoryName = newCategoryName.value.trim()
  if (!categoryName) return

  // 这里调用创建分类的逻辑，相当于在云盘文档目录下创建文件夹
  console.log('创建新分类:', categoryName)
  
  showCreateCategoryDialog.value = false
  newCategoryName.value = ''
}

// 上传文档文件的方法
const uploadDocumentFiles = async () => {
  if (selectedDocumentFiles.value.length === 0) return
  
  // 获取当前分类的路径，如果没有则上传到文档根目录
  const currentCategory = docsStore.currentCategoryData
  const targetPath = currentCategory ? `/文档/${currentCategory.name}` : '/文档'
  
  // 使用 TransferStore 处理上传
  await transferStore.uploadFiles(selectedDocumentFiles.value, targetPath)
  
  showUploadDocumentDialog.value = false
  selectedDocumentFiles.value = []
  toast.success(`已开始上传 ${selectedDocumentFiles.value.length} 个文档文件`)
}

// 新建Markdown文档的方法
const createMarkdownDocument = () => {
  const docName = newDocumentName.value.trim()
  if (!docName) return

  const newDoc = {
    name: docName + '.md',
    type: 'markdown',
    size: 0,
    modifiedAt: new Date(),
    path: `/文档/${docsStore.currentCategoryData?.name}/${docName}`,
    categoryId: docsStore.currentCategory,
    summary: newDocumentSummary.value || '新建的Markdown文档',
    content: `# ${docName}\n\n这是一个新的Markdown文档，请开始编辑内容。`
  }
  
  docsStore.addDocument(docsStore.currentCategory, newDoc)
  
  showAddMarkdownDialog.value = false
  newDocumentName.value = ''
  newDocumentSummary.value = ''
}

// 处理文档文件选择
const handleDocumentFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  selectedDocumentFiles.value = files
}

// 右键菜单相关方法
const showDocumentContextMenu = (event: MouseEvent, doc: Document) => {
  selectedDocument.value = doc
  
  const menuItems: ContextMenuItem[] = [
    {
      id: 'open',
      label: '打开',
      action: () => openDocument()
    },
    {
      id: 'rename',
      label: '重命名',
      action: () => showRenameDocumentDialog()
    },
    {
      id: 'separator1',
      separator: true
    },
    {
      id: 'delete',
      label: '删除',
      type: 'danger',
      action: () => deleteDocument()
    }
  ]
  
  contextMenuStore.showContextMenu(event, menuItems, doc)
}

const openDocument = () => {
  if (selectedDocument.value) {
    docsStore.setCurrentDocument(selectedDocument.value)
  }
}

const showRenameDocumentDialog = () => {
  if (selectedDocument.value) {
    renameDocValue.value = selectedDocument.value.name
    showRenameDocDialog.value = true
    
    // 在下一个tick自动聚焦并选中文本
    nextTick(() => {
      if (renameDocInput.value) {
        renameDocInput.value.focus()
        renameDocInput.value.select()
      }
    })
  }
}

const confirmRenameDocument = () => {
  const newName = renameDocValue.value.trim()
  if (!newName || !selectedDocument.value) return

  // 检查名称是否与原名称相同
  if (newName === selectedDocument.value.name) {
    cancelRenameDocument()
    return
  }

  // 检查名称是否包含非法字符
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(newName)) {
    toast.error('文件名不能包含以下字符：< > : " / \\ | ? *')
    return
  }

  const oldName = selectedDocument.value.name
  
  // 调用DocsStore的重命名方法（如果有的话，或者直接修改）
  selectedDocument.value.name = newName
  
  showRenameDocDialog.value = false
  renameDocValue.value = ''
  toast.success(`"${oldName}" 已重命名为 "${newName}"`)
}

const cancelRenameDocument = () => {
  showRenameDocDialog.value = false
  renameDocValue.value = ''
}

const deleteDocument = () => {
  if (selectedDocument.value) {
    const docName = selectedDocument.value.name
    if (confirm(`确定要删除文档 "${docName}" 吗？`)) {
      // 调用DocsStore的删除方法
      docsStore.deleteDocument(selectedDocument.value.id)
      toast.success(`文档 "${docName}" 已删除`)
    }
  }
}

// 分类右键菜单相关方法
const handleCategoryContextMenu = (event: MouseEvent, category: DocumentCategory) => {
  selectedCategory.value = category
  
  const menuItems: ContextMenuItem[] = [
    {
      id: 'open',
      label: '打开',
      action: () => openCategory()
    },
    {
      id: 'rename',
      label: '重命名',
      action: () => showRenameCategoryDialogFn()
    },
    {
      id: 'separator1',
      separator: true
    },
    {
      id: 'delete',
      label: '删除',
      type: 'danger',
      action: () => deleteCategory()
    }
  ]
  
  contextMenuStore.showContextMenu(event, menuItems, category)
}

const openCategory = () => {
  if (selectedCategory.value) {
    docsStore.setCurrentCategory(selectedCategory.value.id)
  }
}

const showRenameCategoryDialogFn = () => {
  if (selectedCategory.value) {
    renameCategoryValue.value = selectedCategory.value.name
    showRenameCategoryDialog.value = true
    
    // 在下一个tick自动聚焦并选中文本
    nextTick(() => {
      if (renameCategoryInput.value) {
        renameCategoryInput.value.focus()
        renameCategoryInput.value.select()
      }
    })
  }
}

const confirmRenameCategory = () => {
  const newName = renameCategoryValue.value.trim()
  if (!newName || !selectedCategory.value) return

  // 检查名称是否与原名称相同
  if (newName === selectedCategory.value.name) {
    cancelRenameCategory()
    return
  }

  // 检查名称是否包含非法字符
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(newName)) {
    toast.error('文件名不能包含以下字符：< > : " / \\ | ? *')
    return
  }

  const oldName = selectedCategory.value.name
  
  // 调用DocsStore的重命名方法（如果有的话，或者直接修改）
  selectedCategory.value.name = newName
  
  showRenameCategoryDialog.value = false
  renameCategoryValue.value = ''
  toast.success(`分类 "${oldName}" 已重命名为 "${newName}"`)
}

const cancelRenameCategory = () => {
  showRenameCategoryDialog.value = false
  renameCategoryValue.value = ''
}

const deleteCategory = () => {
  if (selectedCategory.value) {
    const categoryName = selectedCategory.value.name
    if (confirm(`确定要删除分类 "${categoryName}" 吗？`)) {
      // 调用DocsStore的删除方法
      docsStore.deleteCategory(selectedCategory.value.id)
      toast.success(`分类 "${categoryName}" 已删除`)
    }
  }
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