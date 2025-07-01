/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/*' {
  const value: any
  export default value
}

declare module '*.ts' {
  const value: any
  export default value
}

declare module 'vue' {
  const value: any
  export default value
  export const createApp: any
}

declare module 'pinia' {
  const value: any
  export default value
  export const createPinia: any
  export const storeToRefs: any
}

declare module 'fs-extra' {
  const value: any
  export default value
}

declare module 'vue-router' {
  const value: any
  export default value
  export const createRouter: any
  export const createWebHistory: any
  export const createWebHashHistory: any
  export const useRoute: any
  export const useRouter: any
  export type RouteRecordRaw = any
}

declare module 'lucide-vue-next' {
  const value: any
  export default value
  export const X: any
  export const Home: any
  export const HardDrive: any
  export const Music: any
  export const FileText: any
  export const Settings: any
  export const PenTool: any
  export const User: any
  export const Minus: any
  export const Square: any
  export const Play: any
  export const Pause: any
  export const SkipBack: any
  export const SkipForward: any
  export const Volume2: any
  export const VolumeX: any
  export const Repeat: any
  export const List: any
  export const ChevronUp: any
  export const ChevronLeft: any
  export const ChevronRight: any
  export const Clock: any
  export const Loader2: any
  export const LogOut: any
} 