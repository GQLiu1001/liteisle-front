import { createPinia } from 'pinia'
import { useAuthStore } from './AuthStore'
import { useUIStore } from './UIStore'
import { useDriveStore } from './DriveStore'
import { useDocsStore } from './DocsStore'
import { useMusicStore } from './MusicStore'
import { useTransferStore } from './TransferStore'
import { useSettingsStore } from './SettingsStore'
import { useFocusStore } from './FocusStore'
import { useContextMenuStore } from './ContextMenuStore'
import { useVditorStore } from './VditorStore'

const pinia = createPinia()

export {
  pinia,
  useAuthStore,
  useUIStore,
  useDriveStore,
  useDocsStore,
  useMusicStore,
  useTransferStore,
  useSettingsStore,
  useFocusStore,
  useContextMenuStore,
  useVditorStore
} 