import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API } from '@/utils/api'
import { onFileStatusUpdated } from '@/utils/websocket'
import { useToast } from 'vue-toastification'
import { FileStatusEnum } from '@/types/api'
import type {
  DocumentViewResp,
  FolderInfo,
  FileInfo,
  MarkdownContentResp,
  MarkdownUpdateReq,
  MarkdownCreateReq,
  TranslateReq,
  TranslateResp
} from '@/types/api'

export const useDocsStore = defineStore('docs', () => {
  const toast = useToast()
  
  // === 文档数据状态 ===
  const booklists = ref<FolderInfo[]>([])     // 笔记本列表（文件夹）
  const allDocuments = ref<FileInfo[]>([])    // 所有文档文件
  const isLoading = ref(false)
  const searchQuery = ref('')
  const lastUpdated = ref<Date | null>(null)
  
  // === 当前选择状态 ===
  const currentBooklist = ref<FolderInfo | null>(null)  // 当前选择的笔记本
  const selectedDocument = ref<FileInfo | null>(null)   // 当前选择的文档
  
  // === Markdown编辑状态 ===
  const currentMarkdownContent = ref('')
  const currentMarkdownVersion = ref(0)
  const isMarkdownMode = ref(false)
  const hasUnsavedChanges = ref(false)
  const isSaving = ref(false)
  
  // === 翻译功能状态 ===
  const isTranslating = ref(false)
  const lastTranslation = ref<TranslateResp | null>(null)
  
  // === 计算属性 ===
  const currentBooklistDocuments = computed(() => {
    if (!currentBooklist.value) return []
    return allDocuments.value.filter(file => 
      file.folder_id === currentBooklist.value!.id &&
      file.file_status === FileStatusEnum.AVAILABLE
    ).sort((a, b) => a.sorted_order - b.sorted_order)
  })
  
  const filteredDocuments = computed(() => {
    const documents = currentBooklistDocuments.value
    if (!searchQuery.value) return documents
    
    const query = searchQuery.value.toLowerCase()
    return documents.filter(doc => 
      doc.file_name.toLowerCase().includes(query)
    )
  })
  
  const canSaveMarkdown = computed(() => {
    return isMarkdownMode.value && hasUnsavedChanges.value && !isSaving.value
  })
  
  const isMarkdownDocument = computed(() => {
    return selectedDocument.value?.file_name.toLowerCase().endsWith('.md') || false
  })
  
  /**
   * 设置WebSocket监听
   */
  const setupWebSocketListeners = () => {
    onFileStatusUpdated((payload) => {
      // 更新对应文档文件的状态
      const fileIndex = allDocuments.value.findIndex(file => file.id === payload.file_id)
      if (fileIndex > -1 && payload.file_data) {
        allDocuments.value[fileIndex] = payload.file_data
        
        if (payload.file_status === FileStatusEnum.AVAILABLE) {
          toast.success(`文档 "${payload.file_data.file_name}" 处理完成`)
        } else if (payload.file_status === FileStatusEnum.FAILED) {
          toast.error(`文档 "${payload.file_data.file_name}" 处理失败`)
        }
      }
    })
  }
  
  /**
   * 加载文档页面数据
   */
  const loadDocumentsData = async (content?: string): Promise<void> => {
    try {
      isLoading.value = true
      const response = await API.document.getDocumentView(content)
      
      if (response.data) {
        booklists.value = response.data.booklists || []
        allDocuments.value = response.data.files || []
        lastUpdated.value = new Date()
      }
    } catch (error) {
      console.error('加载文档数据失败:', error)
      toast.error('加载文档数据失败')
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 搜索文档
   */
  const searchDocuments = async (query: string): Promise<void> => {
    searchQuery.value = query
    await loadDocumentsData(query)
  }
  
  /**
   * 选择笔记本
   */
  const selectBooklist = (booklist: FolderInfo): void => {
    currentBooklist.value = booklist
    
    // 如果当前选择的文档不在新选择的笔记本中，清除选择
    if (selectedDocument.value) {
      const booklistDocuments = allDocuments.value.filter(file => file.folder_id === booklist.id)
      if (!booklistDocuments.find(doc => doc.id === selectedDocument.value!.id)) {
        closeDocument()
      }
    }
  }
  
  /**
   * 选择文档
   */
  const selectDocument = async (document: FileInfo): Promise<void> => {
    // 如果有未保存的更改，提示用户
    if (hasUnsavedChanges.value) {
      const confirmed = confirm('您有未保存的更改，是否要放弃更改？')
      if (!confirmed) {
        return
      }
    }
    
    selectedDocument.value = document
    
    if (isMarkdownDocument.value) {
      await loadMarkdownContent(document.id)
    } else {
      // 对于非Markdown文档，退出编辑模式
      exitMarkdownMode()
    }
  }
  
  /**
   * 关闭文档
   */
  const closeDocument = (): void => {
    if (hasUnsavedChanges.value) {
      const confirmed = confirm('您有未保存的更改，是否要放弃更改？')
      if (!confirmed) {
        return
      }
    }
    
    selectedDocument.value = null
    exitMarkdownMode()
  }
  
  /**
   * 获取文档预览/下载链接
   */
  const getDocumentViewUrl = async (fileId: number): Promise<string | null> => {
    try {
      const response = await API.document.getViewUrl(fileId)
      return response.data || null
    } catch (error) {
      console.error('获取文档链接失败:', error)
      toast.error('获取文档链接失败')
      return null
    }
  }
  
  /**
   * 加载Markdown文档内容
   */
  const loadMarkdownContent = async (fileId: number): Promise<void> => {
    try {
      isLoading.value = true
      const response = await API.document.getMarkdownContent(fileId)
      
      if (response.data) {
        currentMarkdownContent.value = response.data.content
        currentMarkdownVersion.value = response.data.version
        isMarkdownMode.value = true
        hasUnsavedChanges.value = false
      }
    } catch (error) {
      console.error('加载Markdown内容失败:', error)
      toast.error('加载Markdown内容失败')
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 更新Markdown文档内容
   */
  const updateMarkdownContent = (content: string): void => {
    if (content !== currentMarkdownContent.value) {
      currentMarkdownContent.value = content
      hasUnsavedChanges.value = true
    }
  }
  
  /**
   * 保存Markdown文档
   */
  const saveMarkdownDocument = async (): Promise<boolean> => {
    if (!selectedDocument.value || !canSaveMarkdown.value) {
      return false
    }
    
    try {
      isSaving.value = true
      
      const updateData: MarkdownUpdateReq = {
        content: currentMarkdownContent.value,
        version: currentMarkdownVersion.value
      }
      
      await API.document.updateMarkdownContent(selectedDocument.value.id, updateData)
      
      hasUnsavedChanges.value = false
      currentMarkdownVersion.value++ // 增加版本号
      toast.success('文档保存成功')
      return true
    } catch (error) {
      console.error('保存Markdown文档失败:', error)
      toast.error('保存文档失败')
      return false
    } finally {
      isSaving.value = false
    }
  }
  
  /**
   * 创建新的Markdown文档
   */
  const createMarkdownDocument = async (name: string, folderId: number): Promise<boolean> => {
    try {
      isLoading.value = true
      
      const createData: MarkdownCreateReq = {
        name: name.endsWith('.md') ? name : `${name}.md`,
        folder_id: folderId
      }
      
      const response = await API.document.createMarkdown(createData)
      
      if (response.data) {
        toast.success('Markdown文档创建成功')
        
        // 刷新文档列表
        await loadDocumentsData()
        
        // 如果当前在对应的笔记本中，自动选择新创建的文档
        const newDocument = allDocuments.value.find(doc => doc.id === response.data)
        if (newDocument && currentBooklist.value?.id === folderId) {
          await selectDocument(newDocument)
        }
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('创建Markdown文档失败:', error)
      toast.error('创建文档失败')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 进入Markdown编辑模式
   */
  const enterMarkdownMode = (): void => {
    if (isMarkdownDocument.value && selectedDocument.value) {
      loadMarkdownContent(selectedDocument.value.id)
    }
  }
  
  /**
   * 退出Markdown编辑模式
   */
  const exitMarkdownMode = (): void => {
    if (hasUnsavedChanges.value) {
      const confirmed = confirm('您有未保存的更改，是否要放弃更改？')
      if (!confirmed) {
        return
      }
    }
    
    isMarkdownMode.value = false
    currentMarkdownContent.value = ''
    currentMarkdownVersion.value = 0
    hasUnsavedChanges.value = false
  }
  
  /**
   * 划词翻译
   */
  const translateText = async (
    text: string, 
    targetLang = 'zh-CN'
  ): Promise<TranslateResp | null> => {
    if (!selectedDocument.value) {
      toast.error('请先选择一个文档')
      return null
    }
    
    try {
      isTranslating.value = true
      
      const translateData: TranslateReq = {
        text: text.trim(),
        target_lang: targetLang,
        file_name: selectedDocument.value.file_name
      }
      
      const response = await API.translate.translate(translateData)
      
      if (response.data) {
        lastTranslation.value = response.data
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('翻译失败:', error)
      toast.error('翻译失败')
      return null
    } finally {
      isTranslating.value = false
    }
  }
  
  /**
   * 获取笔记本中的文档数量
   */
  const getBooklistDocumentCount = (booklistId: number): number => {
    return allDocuments.value.filter(file => 
      file.folder_id === booklistId && 
      file.file_status === FileStatusEnum.AVAILABLE
    ).length
  }
  
  /**
   * 检查文档类型
   */
  const getDocumentType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    
    switch (extension) {
      case 'md':
        return 'markdown'
      case 'pdf':
        return 'pdf'
      case 'doc':
      case 'docx':
        return 'word'
      case 'ppt':
      case 'pptx':
        return 'powerpoint'
      case 'xls':
      case 'xlsx':
        return 'excel'
      case 'txt':
        return 'text'
      default:
        return 'unknown'
    }
  }
  
  /**
   * 键盘快捷键处理
   */
  const handleKeyboardShortcut = async (event: KeyboardEvent): Promise<void> => {
    // Ctrl+S 保存
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      if (canSaveMarkdown.value) {
        await saveMarkdownDocument()
      }
    }
    
    // Esc 退出编辑模式
    if (event.key === 'Escape' && isMarkdownMode.value) {
      exitMarkdownMode()
    }
  }
  
  /**
   * 重置状态
   */
  const reset = (): void => {
    booklists.value = []
    allDocuments.value = []
    currentBooklist.value = null
    selectedDocument.value = null
    currentMarkdownContent.value = ''
    currentMarkdownVersion.value = 0
    isMarkdownMode.value = false
    hasUnsavedChanges.value = false
    isSaving.value = false
    isTranslating.value = false
    lastTranslation.value = null
    searchQuery.value = ''
    lastUpdated.value = null
  }
  
  /**
   * 从云盘加载分类（笔记本）
   */
  const loadCategoriesFromDrive = async (): Promise<void> => {
    try {
      isLoading.value = true
      const response = await API.document.getDocumentView()

      if (response.data) {
        booklists.value = response.data.booklists || []
        allDocuments.value = response.data.files || []  // 修复：使用 files 而不是 documents
        lastUpdated.value = new Date()
      }
    } catch (error) {
      console.error('加载文档数据失败:', error)
      toast.error('加载文档数据失败')
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 根据路径加载文档
   */
  const loadDocumentByPath = async (path: string): Promise<void> => {
    try {
      // 根据路径找到对应的文档
             const document = allDocuments.value.find(doc => doc.file_name === path)
      if (document) {
        await selectDocument(document)
      }
    } catch (error) {
      console.error('加载文档失败:', error)
      toast.error('加载文档失败')
    }
  }
  
  /**
   * 设置当前文档
   */
  const setCurrentDocument = (doc: FileInfo | null): void => {
    selectedDocument.value = doc
    if (!doc) {
      currentMarkdownContent.value = ''
      currentMarkdownVersion.value = 0
      isMarkdownMode.value = false
      hasUnsavedChanges.value = false
    }
  }
  
  // 初始化WebSocket监听
  setupWebSocketListeners()
  
  return {
    // 状态
    booklists,
    allDocuments,
    isLoading,
    searchQuery,
    lastUpdated,
    currentBooklist,
    selectedDocument,
    currentMarkdownContent,
    currentMarkdownVersion,
    isMarkdownMode,
    hasUnsavedChanges,
    isSaving,
    isTranslating,
    lastTranslation,
    
    // 计算属性
    currentBooklistDocuments,
    filteredDocuments,
    
    // 方法
    loadDocumentsData,
    searchDocuments,
    selectBooklist,
    selectDocument,
    closeDocument,
    getDocumentViewUrl,
    getBooklistDocumentCount,
    getDocumentType,
    loadMarkdownContent,
    updateMarkdownContent,
    saveMarkdownDocument,
    createMarkdownDocument,
    enterMarkdownMode,
    exitMarkdownMode,
    translateText,
    handleKeyboardShortcut,
    reset,
    loadCategoriesFromDrive,
    loadDocumentByPath,
    setCurrentDocument
  }
}) 