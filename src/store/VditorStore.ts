import { defineStore } from 'pinia'
import { ref } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

export const useVditorStore = defineStore('vditor', () => {
  // 全局Vditor实例
  const vditorInstance = ref<Vditor | null>(null)
  const isInitialized = ref(false)
  const isInitializing = ref(false)

  // 初始化Vditor实例
  const initializeVditor = async (): Promise<void> => {
    if (isInitialized.value || isInitializing.value) {
      return
    }

    isInitializing.value = true

    try {
      // 创建一个隐藏的容器来初始化Vditor
      const hiddenContainer = document.createElement('div')
      hiddenContainer.style.position = 'absolute'
      hiddenContainer.style.left = '-9999px'
      hiddenContainer.style.top = '-9999px'
      hiddenContainer.style.width = '1px'
      hiddenContainer.style.height = '1px'
      hiddenContainer.style.overflow = 'hidden'
      document.body.appendChild(hiddenContainer)

      // 预加载Vditor并初始化
      const vditor = new Vditor(hiddenContainer, {
        height: 400,
        mode: 'ir',
        value: '',
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
            engine: 'KaTeX',
            inlineDigit: false
          },
          markdown: {
            codeBlockPreview: false,
            mathBlockPreview: true,
            autoSpace: true,
            fixTermTypo: true,
            toc: true,
            footnotes: true,
            paragraphBeginningSpace: false,
            listStyle: true,
            linkBase: '',
            linkPrefix: '',
            mark: true
          }
        },
        toolbar: [],
        counter: {
          enable: false
        },
        cache: {
          enable: false
        },
        outline: {
          enable: false
        },
        tab: '\t',
        hint: {
          delay: 200,
          emoji: {
            '+1': '👍',
            '-1': '👎', 
            'heart': '❤️',
            'smile': '😊',
            'laughing': '😆',
            'blush': '😊',
            'smiley': '😃',
            'relaxed': '😌',
            'smirk': '😏',
            'heart_eyes': '😍',
            'kissing_heart': '😘',
            'kissing_closed_eyes': '😚',
            'flushed': '😳',
            'relieved': '😌',
            'satisfied': '😆',
            'grin': '😁',
            'wink': '😉',
            'stuck_out_tongue_winking_eye': '😜',
            'stuck_out_tongue_closed_eyes': '😝',
            'grinning': '😀',
            'kissing': '😗',
            'kissing_smiling_eyes': '😙',
            'stuck_out_tongue': '😛',
            'sleeping': '😴',
            'worried': '😟',
            'frowning': '😦',
            'anguished': '😧',
            'open_mouth': '😮',
            'grimacing': '😬',
            'confused': '😕',
            'hushed': '😯',
            'expressionless': '😑',
            'unamused': '😒',
            'sweat_smile': '😅',
            'sweat': '😓',
            'disappointed_relieved': '😥',
            'weary': '😩',
            'pensive': '😔',
            'disappointed': '😞',
            'confounded': '😖',
            'fearful': '😨',
            'cold_sweat': '😰',
            'persevere': '😣',
            'cry': '😢',
            'sob': '😭',
            'joy': '😂',
            'astonished': '😲',
            'scream': '😱'
          },
          emojiPath: 'https://unpkg.com/vditor/dist/images/emoji'
        },
        after: () => {
          // 清理隐藏容器
          document.body.removeChild(hiddenContainer)
          isInitialized.value = true
          isInitializing.value = false
        }
      })

      vditorInstance.value = vditor
    } catch (error) {
      console.error('初始化全局Vditor实例失败:', error)
      isInitializing.value = false
    }
  }

  // 创建Vditor实例（供组件使用）
  const createVditorInstance = async (
    element: HTMLElement,
    options: any = {}
  ): Promise<Vditor> => {
    // 确保全局实例已初始化
    if (!isInitialized.value) {
      await initializeVditor()
    }

    // 创建新的Vditor实例
    const defaultOptions = {
      height: '100%',
      mode: 'ir',
      value: '',
      placeholder: '开始编写 Markdown...',
      theme: 'classic',
      typewriterMode: false,
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
          engine: 'KaTeX',
          inlineDigit: false
        },
        markdown: {
          codeBlockPreview: false,
          mathBlockPreview: true,
          autoSpace: true,
          fixTermTypo: true,
          toc: true,
          footnotes: true,
          paragraphBeginningSpace: false,
          listStyle: true,
          linkBase: '',
          linkPrefix: '',
          mark: true
        }
      },
      toolbar: [],
      counter: {
        enable: false
      },
      cache: {
        enable: false
      },
      outline: {
        enable: true,
        position: 'left'
      },
      tab: '\t',
      hint: {
        delay: 0,
        emoji: false,
        emojiPath: '',
        parse: false,
        extend: []
      }
    }

    const mergedOptions = { ...defaultOptions, ...options }
    return new Vditor(element, mergedOptions)
  }

  // 销毁全局实例
  const destroyVditor = () => {
    if (vditorInstance.value) {
      vditorInstance.value.destroy()
      vditorInstance.value = null
      isInitialized.value = false
    }
  }

  return {
    vditorInstance,
    isInitialized,
    isInitializing,
    initializeVditor,
    createVditorInstance,
    destroyVditor
  }
})