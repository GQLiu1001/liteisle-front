import { createPinia } from 'pinia'

// 全局状态管理
import { useUIStore } from './UIStore'
import { useContextMenuStore } from './ContextMenuStore'
import { useVditorStore } from './VditorStore'
import { useShareStore } from './ShareStore'
import { useIslandStore } from './IslandStore'
import { useSettingsStore } from './SettingsStore'

// V5版本的新Store
import { useAuthStoreV5 } from './AuthStoreV5'
import { useDriveStoreV5 } from './DriveStoreV5'
import { useMusicStoreV5 } from './MusicStoreV5'
import { useDocsStoreV5 } from './DocsStoreV5'
import { useTransferStoreV5 } from './TransferStoreV5'
import { useFocusStoreV5 } from './FocusStoreV5'

const pinia = createPinia()

export {
  pinia,
  // 全局Store
  useUIStore,
  useContextMenuStore,
  useVditorStore,
  useShareStore,
  useIslandStore,
  useSettingsStore,

  // V5版本Store
  useAuthStoreV5,
  useDriveStoreV5,
  useMusicStoreV5,
  useDocsStoreV5,
  useTransferStoreV5,
  useFocusStoreV5
} 