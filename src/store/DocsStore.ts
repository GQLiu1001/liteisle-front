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
        // 检查数据结构，适配不同的响应格式
        const actualData = (response.data as any).data || response.data
        console.log('Documents API response:', response)
        console.log('实际数据结构:', actualData)
        console.log('API返回的booklists:', actualData.booklists)
        console.log('API返回的files:', actualData.files)
        
        booklists.value = actualData.booklists || []
        allDocuments.value = actualData.files || []
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

      console.log('获取文档链接API响应:', response)

      if (response.data && response.data.code === 200 && response.data.data) {
        return response.data.data
      } else {
        console.warn('获取文档链接API响应格式错误:', response.data)
        toast.error(response.data?.message || '获取文档链接失败')
        return null
      }
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

      console.log('加载Markdown内容API响应:', response)

      if (response.data && response.data.code === 200 && response.data.data) {
        const markdownData = response.data.data
        currentMarkdownContent.value = markdownData.content
        currentMarkdownVersion.value = markdownData.version
        isMarkdownMode.value = true
        hasUnsavedChanges.value = false
      } else {
        console.warn('加载Markdown内容API响应格式错误:', response.data)
        toast.error(response.data?.message || '加载Markdown内容失败')
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
      
      const response = await API.document.updateMarkdownContent(selectedDocument.value.id, updateData)

      console.log('保存Markdown文档API响应:', response)

      if (response.data && response.data.code === 200) {
        hasUnsavedChanges.value = false
        currentMarkdownVersion.value++ // 增加版本号
        toast.success('文档保存成功')
        return true
      } else {
        console.warn('保存Markdown文档API响应格式错误:', response.data)
        toast.error(response.data?.message || '保存文档失败')
        return false
      }
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

      console.log('创建Markdown文档API响应:', response)

      if (response.data && response.data.code === 200 && response.data.data) {
        const newDocumentId = response.data.data
        toast.success('Markdown文档创建成功')

        // 刷新文档列表
        await loadDocumentsData()

        // 如果当前在对应的笔记本中，自动选择新创建的文档
        const newDocument = allDocuments.value.find(doc => doc.id === newDocumentId)
        if (newDocument && currentBooklist.value?.id === folderId) {
          await selectDocument(newDocument)
        }

        return true
      } else {
        console.warn('创建Markdown文档API响应格式错误:', response.data)
        toast.error(response.data?.message || '创建文档失败')
        return false
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

      console.log('翻译API响应:', response)

      if (response.data && response.data.code === 200 && response.data.data) {
        lastTranslation.value = response.data.data
        return response.data.data
      } else {
        console.warn('翻译API响应格式错误:', response.data)
        toast.error(response.data?.message || '翻译失败')
        return null
      }
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
        // 检查数据结构，适配不同的响应格式
        const actualData = (response.data as any).data || response.data
        console.log('Documents API response:', response)
        console.log('实际数据结构:', actualData)
        console.log('API返回的booklists:', actualData.booklists)
        console.log('API返回的files:', actualData.files)
        
        booklists.value = actualData.booklists || []
        allDocuments.value = actualData.files || []
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

  /**
   * 重新排序分类（笔记本）
   */
  const reorderCategories = async (oldIndex: number, newIndex: number): Promise<void> => {
    try {
      const categories = [...booklists.value]
      if (oldIndex < 0 || oldIndex >= categories.length || newIndex < 0 || newIndex >= categories.length) {
        console.error('排序索引超出范围')
        return
      }

      const movedCategory = categories[oldIndex]

      // 计算before_id和after_id
      let beforeId: number | null = null
      let afterId: number | null = null

      if (newIndex > 0) {
        beforeId = categories[newIndex - (newIndex > oldIndex ? 0 : 1)].id
      }
      if (newIndex < categories.length - 1) {
        afterId = categories[newIndex + (newIndex > oldIndex ? 1 : 0)].id
      }

      // 调用API设置排序
      await API.item.setOrder(movedCategory.id, 'folder', {
        before_id: beforeId,
        after_id: afterId
      })

      // 重新加载数据以获取最新排序
      await loadCategoriesFromDrive()
      toast.success('分类排序已更新')
    } catch (error) {
      console.error('重新排序分类失败:', error)
      toast.error('重新排序分类失败')
    }
  }

  /**
   * 重新排序当前分类中的文档
   */
  const reorderDocumentsInCurrentCategory = async (oldIndex: number, newIndex: number): Promise<void> => {
    try {
      if (!currentBooklist.value) {
        console.error('没有选择当前分类')
        return
      }

      const documents = [...currentBooklistDocuments.value]
      if (oldIndex < 0 || oldIndex >= documents.length || newIndex < 0 || newIndex >= documents.length) {
        console.error('排序索引超出范围')
        return
      }

      const movedDocument = documents[oldIndex]

      // 计算before_id和after_id
      let beforeId: number | null = null
      let afterId: number | null = null

      if (newIndex > 0) {
        beforeId = documents[newIndex - (newIndex > oldIndex ? 0 : 1)].id
      }
      if (newIndex < documents.length - 1) {
        afterId = documents[newIndex + (newIndex > oldIndex ? 1 : 0)].id
      }

      // 调用API设置排序
      await API.item.setOrder(movedDocument.id, 'file', {
        before_id: beforeId,
        after_id: afterId
      })

      // 重新加载数据以获取最新排序
      await loadCategoriesFromDrive()
      toast.success('文档排序已更新')
    } catch (error) {
      console.error('重新排序文档失败:', error)
      toast.error('重新排序文档失败')
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
    setCurrentDocument,
    reorderCategories,
    reorderDocumentsInCurrentCategory
  }
}) 