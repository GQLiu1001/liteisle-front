import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDriveStore, type DriveItem } from './DriveStore'
import type { HardDrive } from 'lucide-vue-next';

// 文档接口定义
export interface Document {
  id: string
  name: string
  type: 'pdf' | 'markdown' | 'txt' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx'
  size: number
  modifiedAt: Date
  path: string
  categoryId: string
  content?: string
  summary?: string
}

// 分类接口定义
export interface DocumentCategory {
  id: string
  name: string
  icon: string
  documentCount: number
  documents: Document[]
}

export const useDocsStore = defineStore('docs', () => {
  // 响应式状态
  const currentCategory = ref<string | null>(null)
  const currentDocument = ref<Document | null>(null)
  const searchQuery = ref('')
  const selectedText = ref('')
  const translationResult = ref('')
  const showTranslation = ref(false)
  const translationPosition = ref({ x: 0, y: 0 })

  // 文档数据现在从 DriveStore 动态加载
  const categories = ref<DocumentCategory[]>([])
  
  const getDocTypeFromExtension = (extension: string | undefined): Document['type'] => {
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'md': return 'markdown';
      case 'txt': return 'txt';
      case 'doc': return 'doc';
      case 'docx': return 'docx';
      case 'ppt': return 'ppt';
      case 'pptx': return 'pptx';
      case 'xls': return 'xls';
      case 'xlsx': return 'xlsx';
      default: return 'txt';
    }
  }

  const loadCategoriesFromDrive = () => {
    // 防止重复加载
    if (categories.value.length > 0) return

    const driveStore = useDriveStore()
    const newCategories: DocumentCategory[] = []

    const docsFolder = driveStore.driveItems.find((item: DriveItem) => item.name === '文档' && item.type === 'folder')

    if (docsFolder && docsFolder.children) {
      docsFolder.children.forEach((subfolder: DriveItem) => {
        if (subfolder.type === 'folder' && subfolder.children) {
          const documents: Document[] = subfolder.children
            .filter((file: DriveItem) => file.type === 'document')
            .map((file: DriveItem) => {
              const extension = file.name.split('.').pop()?.toLowerCase();
              const fileType = getDocTypeFromExtension(extension);
              return {
                id: file.id,
                name: file.name,
                type: fileType,
                size: file.size,
                modifiedAt: file.modifiedAt,
                path: file.path,
                categoryId: subfolder.id,
                // 为演示目的，动态生成模拟内容和摘要
                content: `# ${file.name}\n\n这是从云盘加载的文档 **${file.name}** 的模拟内容。`,
                summary: `这是一个关于 "${file.name.split('.')[0]}" 的文档。`
              }
            })

          if (documents.length > 0) {
            newCategories.push({
              id: subfolder.id,
              name: subfolder.name,
              icon: 'Book', // 可以根据需要设置不同的图标
              documentCount: documents.length,
              documents: documents
            })
          }
        }
      })
    }
    
    categories.value = newCategories
    // 默认选中第一个分类
    if (newCategories.length > 0 && !currentCategory.value) {
      currentCategory.value = newCategories[0].id
    }
  }

  // 计算属性
  const currentCategoryData = computed(() => {
    return categories.value.find((cat: DocumentCategory) => cat.id === currentCategory.value)
  })

  const categoriesWithFilteredCounts = computed(() => {
    if (!searchQuery.value) {
      return categories.value;
    }
    const query = searchQuery.value.toLowerCase();
    return categories.value.map(category => {
      const filteredCount = category.documents.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        (doc.summary && doc.summary.toLowerCase().includes(query))
      ).length;
      return {
        ...category,
        documentCount: filteredCount
      };
    });
  });

  const filteredDocuments = computed(() => {
    if (currentCategoryData.value) {
      const { documents } = currentCategoryData.value
      const query = searchQuery.value.toLowerCase()
      if (!query) return documents

      return documents.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        (doc.summary && doc.summary.toLowerCase().includes(query))
      )
    }
    return []
  })

  const loadDocumentByPath = (path: string) => {
    for (const category of categories.value) {
      const doc = category.documents.find(d => d.path === path)
      if (doc) {
        currentCategory.value = category.id
        currentDocument.value = doc
        return
      }
    }
    console.error(`在 DocsStore 中未找到路径为 "${path}" 的文档`)
    currentDocument.value = null // or a specific "not found" state
  }

  // Actions
  const setCurrentCategory = (categoryId: string) => {
    currentCategory.value = categoryId
    currentDocument.value = null
  }

  const setCurrentDocument = (document: Document | null) => {
    currentDocument.value = document
  }

  const reorderDocumentsInCurrentCategory = (oldIndex: number, newIndex: number) => {
    if (!currentCategoryData.value) return;

    const documents = currentCategoryData.value.documents;
    const [movedItem] = documents.splice(oldIndex, 1);
    documents.splice(newIndex, 0, movedItem);
  };

  const addDocument = (categoryId: string, document: Omit<Document, 'id'>) => {
    const newDocument: Document = {
      ...document,
      id: Date.now().toString()
    }

    const category = categories.value.find((cat: DocumentCategory) => cat.id === categoryId)
    if (category) {
      category.documents.push(newDocument)
      category.documentCount = category.documents.length
    }
  }

  const setSelectedText = (text: string) => {
    selectedText.value = text
  }

  const showTranslationPopup = (x: number, y: number) => {
    translationPosition.value = { x, y }
    showTranslation.value = true
  }

  const hideTranslationPopup = () => {
    showTranslation.value = false
    translationResult.value = ''
  }

  const translateText = async (text: string) => {
    // 模拟翻译API调用
    translationResult.value = '翻译中...'
    
    setTimeout(() => {
      // 简单的模拟翻译结果
      const translations: Record<string, string> = {
        'design patterns': '设计模式',
        'javascript': 'JavaScript 编程语言',
        'vue': 'Vue.js 框架',
        'react': 'React.js 框架',
        'typescript': 'TypeScript 编程语言',
        'nodejs': 'Node.js 运行时环境'
      }
      
      const lowerText = text.toLowerCase()
      translationResult.value = translations[lowerText] || `"${text}" 的翻译结果`
    }, 1000)
  }

  // 保存文档内容
  const saveDocumentContent = (content: string) => {
    if (currentDocument.value && currentDocument.value.type === 'markdown') {
      currentDocument.value.content = content
      // TODO: 调用后端 API 保存内容
      console.log('保存文档内容:', content)
    }
  }

  // 移动端相关
  const showMobileDocList = ref(false)

  return {
    // State
    currentCategory,
    currentDocument,
    searchQuery,
    selectedText,
    translationResult,
    showTranslation,
    translationPosition,
    categories,
    
    // Computed
    currentCategoryData,
    categoriesWithFilteredCounts,
    filteredDocuments,
    
    // Actions
    setCurrentCategory,
    setCurrentDocument,
    reorderDocumentsInCurrentCategory,
    addDocument,
    setSelectedText,
    showTranslationPopup,
    hideTranslationPopup,
    translateText,
    saveDocumentContent,
    loadDocumentByPath,
    loadCategoriesFromDrive,
    showMobileDocList
  }
}, {
  persist: {
    // ... existing code ...
  }
}) 