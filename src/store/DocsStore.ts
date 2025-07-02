import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  const currentCategory = ref<string>('books')
  const currentDocument = ref<Document | null>(null)
  const searchQuery = ref('')
  const selectedText = ref('')
  const translationResult = ref('')
  const showTranslation = ref(false)
  const translationPosition = ref({ x: 0, y: 0 })

  // 模拟文档分类数据
  const categories = ref<DocumentCategory[]>([
    {
      id: 'books',
      name: '图书',
      icon: 'Book',
      documentCount: 15,
      documents: [
        {
          id: 'book1',
          name: 'Vue 3 开发指南.pdf',
          type: 'pdf',
          size: 15728640,
          modifiedAt: new Date('2024-01-20'),
          path: '/文档/图书/Vue 3 开发指南.pdf',
          categoryId: 'books',
          summary: 'Vue 3 框架深入学习教程'
        },
        {
          id: 'book2',
          name: 'JavaScript 高级程序设计.pdf',
          type: 'pdf',
          size: 25165824,
          modifiedAt: new Date('2024-01-18'),
          path: '/文档/图书/JavaScript 高级程序设计.pdf',
          categoryId: 'books',
          summary: 'JavaScript 语言权威指南'
        },
        {
          id: 'book3',
          name: '设计模式.md',
          type: 'markdown',
          size: 1048576,
          modifiedAt: new Date('2024-01-15'),
          path: '/文档/图书/设计模式.md',
          categoryId: 'books',
          content: `# 设计模式学习笔记

## 概述
设计模式是在软件设计中针对特定问题的典型解决方案。

## 创建型模式

### 单例模式
确保一个类只有一个实例，并提供一个全局访问点。

\`\`\`javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
  }
}
\`\`\`

### 工厂模式
创建对象时不会对客户端暴露创建逻辑。

## 结构型模式

### 适配器模式
允许接口不兼容的类可以合作。

### 装饰器模式
动态地给一个对象添加一些额外的职责。

## 行为型模式

### 观察者模式
定义对象间的一种一对多的依赖关系。

### 策略模式
定义一系列的算法，把它们一个个封装起来。

## 总结
设计模式是解决软件设计问题的利器，合理使用可以提高代码质量和可维护性。`,
          summary: '软件设计模式详解'
        },
        {
          id: 'book4',
          name: 'Python编程入门.doc',
          type: 'doc',
          size: 8388608,
          modifiedAt: new Date('2024-01-25'),
          path: '/文档/图书/Python编程入门.doc',
          categoryId: 'books',
          summary: 'Python基础语法与实践教程'
        },
        {
          id: 'book5',
          name: 'Node.js开发实战.docx',
          type: 'docx',
          size: 12582912,
          modifiedAt: new Date('2024-01-23'),
          path: '/文档/图书/Node.js开发实战.docx',
          categoryId: 'books',
          summary: 'Node.js后端开发完整指南'
        },
        {
          id: 'book6',
          name: '数据库设计原理.doc',
          type: 'doc',
          size: 6291456,
          modifiedAt: new Date('2024-01-21'),
          path: '/文档/图书/数据库设计原理.doc',
          categoryId: 'books',
          summary: '关系型数据库设计与优化'
        },
        {
          id: 'book7',
          name: '前端架构设计.pptx',
          type: 'pptx',
          size: 18874368,
          modifiedAt: new Date('2024-01-27'),
          path: '/文档/图书/前端架构设计.pptx',
          categoryId: 'books',
          summary: '现代前端架构设计理念与实践'
        },
        {
          id: 'book8',
          name: '数据分析入门.xlsx',
          type: 'xlsx',
          size: 4194304,
          modifiedAt: new Date('2024-01-26'),
          path: '/文档/图书/数据分析入门.xlsx',
          categoryId: 'books',
          summary: 'Excel数据分析技巧与方法'
        },
        {
          id: 'book9',
          name: '项目管理培训.ppt',
          type: 'ppt',
          size: 15728640,
          modifiedAt: new Date('2024-01-24'),
          path: '/文档/图书/项目管理培训.ppt',
          categoryId: 'books',
          summary: '敏捷项目管理方法论'
        },
        {
          id: 'book10',
          name: '财务报表模板.xls',
          type: 'xls',
          size: 2097152,
          modifiedAt: new Date('2024-01-23'),
          path: '/文档/图书/财务报表模板.xls',
          categoryId: 'books',
          summary: '企业财务报表标准模板'
        }
      ]
    },
    {
      id: 'notes',
      name: '笔记',
      icon: 'FileText',
      documentCount: 18,
      documents: [
        {
          id: 'note1',
          name: '学习计划.md',
          type: 'markdown',
          size: 2048,
          modifiedAt: new Date('2024-01-22'),
          path: '/文档/笔记/学习计划.md',
          categoryId: 'notes',
          content: `# 2024年学习计划

## Q1 学习目标
- [ ] 深入学习 Vue 3 Composition API
- [ ] 掌握 TypeScript 高级特性
- [ ] 学习 Node.js 后端开发

## Q2 学习目标  
- [ ] 学习微前端架构
- [ ] 掌握性能优化技巧
- [ ] 学习 Docker 容器化

## Q3 学习目标
- [ ] 学习云原生技术
- [ ] 掌握 K8s 基础
- [ ] 学习 DevOps 流程

## Q4 学习目标
- [ ] 总结全年学习成果
- [ ] 规划下一年发展方向
- [ ] 技术分享和输出`,
          summary: '个人技术学习规划'
        },
        {
          id: 'note2',
          name: '前端面试题.md',
          type: 'markdown',
          size: 8192,
          modifiedAt: new Date('2024-01-20'),
          path: '/文档/笔记/前端面试题.md',
          categoryId: 'notes',
          content: `# 前端面试题总结

## JavaScript 基础

### 1. 数据类型
JavaScript 有 8 种数据类型：
- 基本类型：undefined、null、boolean、number、string、symbol、bigint
- 引用类型：object

### 2. 闭包
闭包是指有权访问另一个函数作用域中变量的函数。

\`\`\`javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    console.log(count);
  };
}
\`\`\`

### 3. 原型链
每个对象都有一个 __proto__ 属性，指向构造函数的 prototype。

## Vue 相关

### 1. 响应式原理
Vue 3 使用 Proxy 实现响应式系统。

### 2. 组件通信
- props/emit
- provide/inject
- vuex/pinia

## React 相关

### 1. Hooks
useState、useEffect、useContext 等。

### 2. 虚拟DOM
React 通过虚拟DOM提高渲染性能。`,
          summary: '前端技术面试要点'
        },
        {
          id: 'note3',
          name: '项目总结报告.docx',
          type: 'docx',
          size: 5242880,
          modifiedAt: new Date('2024-01-26'),
          path: '/文档/笔记/项目总结报告.docx',
          categoryId: 'notes',
          summary: '2023年度项目开发总结与反思'
        },
        {
          id: 'note4',
          name: '会议记录.doc',
          type: 'doc',
          size: 1572864,
          modifiedAt: new Date('2024-01-24'),
          path: '/文档/笔记/会议记录.doc',
          categoryId: 'notes',
          summary: '技术方案讨论会议纪要'
        },
        {
          id: 'note5',
          name: '需求分析文档.docx',
          type: 'docx',
          size: 7340032,
          modifiedAt: new Date('2024-01-22'),
          path: '/文档/笔记/需求分析文档.docx',
          categoryId: 'notes',
          summary: '新功能模块需求详细分析'
        },
        {
          id: 'note6',
          name: '产品演示.pptx',
          type: 'pptx',
          size: 12582912,
          modifiedAt: new Date('2024-01-28'),
          path: '/文档/笔记/产品演示.pptx',
          categoryId: 'notes',
          summary: '新产品功能演示文稿'
        },
        {
          id: 'note7',
          name: '团队任务分配.xlsx',
          type: 'xlsx',
          size: 3145728,
          modifiedAt: new Date('2024-01-27'),
          path: '/文档/笔记/团队任务分配.xlsx',
          categoryId: 'notes',
          summary: '项目团队工作任务分配表'
        },
        {
          id: 'note8',
          name: '培训计划.ppt',
          type: 'ppt',
          size: 8388608,
          modifiedAt: new Date('2024-01-25'),
          path: '/文档/笔记/培训计划.ppt',
          categoryId: 'notes',
          summary: '新员工技术培训方案'
        }
      ]
    },
    {
      id: 'research',
      name: '研究',
      icon: 'Search',
      documentCount: 5,
      documents: [
        {
          id: 'research1',
          name: '人工智能发展趋势.pdf',
          type: 'pdf',
          size: 12582912,
          modifiedAt: new Date('2024-01-19'),
          path: '/文档/研究/人工智能发展趋势.pdf',
          categoryId: 'research',
          summary: 'AI技术发展现状与未来展望'
        }
      ]
    }
  ])

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
    selectedText.value = ''
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
  }
}) 