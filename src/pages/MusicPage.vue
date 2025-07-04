<template>
  <div class="min-h-full bg-liteisle-bg p-4 lg:p-6 select-none">
    <div class="max-w-7xl mx-auto">
      <!-- 移动端布局 - 垂直堆叠 -->
      <div class="lg:hidden space-y-4">
        <!-- 当前播放信息 - 移动端置顶 -->
        <div class="card">
          <div class="flex items-center gap-4 p-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Music :size="32" class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-morandi-900 truncate">{{ musicStore.currentTrackInfo.name }}</h3>
              <p class="text-sm text-morandi-600 truncate">{{ musicStore.currentTrackInfo.artist }}</p>
              <div class="flex items-center justify-between text-xs text-morandi-500 mt-2">
                <span>{{ musicStore.formatTime(musicStore.currentTime) }}</span>
                <span>{{ musicStore.formatTime(musicStore.duration) }}</span>
              </div>
            </div>
          </div>
          <!-- 播放进度条 -->
          <div class="px-4 pb-4">
            <div 
              class="w-full bg-morandi-200 rounded-full h-2 cursor-pointer"
              @click="seekToPosition"
            >
              <div 
                class="bg-teal-500 h-2 rounded-full transition-all duration-100"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 播放列表选择器 - 移动端 -->
        <div class="card">
          <div class="p-4">
            <h3 class="text-lg font-bold text-morandi-900 mb-4">播放列表</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="playlist in musicStore.playlists.slice(0, 4)"
                :key="playlist.id"
                @click="selectPlaylist(playlist)"
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                  musicStore.currentPlaylist?.id === playlist.id 
                    ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                    : 'hover:bg-morandi-100'
                ]"
              >
                <DiscAlbum :size="16" class="text-blue-500 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate text-sm">{{ playlist.name }}</p>
                  <p class="text-xs text-morandi-500">{{ getPlaylistDisplayCount(playlist) }} 首</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 歌曲列表 - 移动端 -->
        <div class="card">
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-bold text-morandi-900">
                  {{ musicStore.currentPlaylist?.name || '选择播放列表' }}
                </h2>
                <p class="text-sm text-morandi-500">{{ filteredTracks.length }} 首歌曲</p>
              </div>
              <button
                v-if="musicStore.currentPlaylist"
                @click="playAll"
                class="flex items-center gap-2 px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
              >
                播放
              </button>
            </div>
            
            <!-- 搜索框 - 移动端 -->
            <div class="mb-4">
              <input
                v-model="musicStore.searchQuery"
                placeholder="搜索音乐..."
                class="w-full px-3 py-2 rounded-lg border border-morandi-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm select-text"
              />
            </div>

            <!-- 歌曲列表 -->
            <div class="space-y-2 max-h-96 overflow-auto">
              <div
                v-for="(track, index) in filteredTracks.slice(0, 10)"
                :key="track.id"
                @click="playTrackImmediately(index)"
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                  musicStore.currentTrack?.id === track.id 
                    ? 'bg-teal-50 border border-teal-300' 
                    : 'hover:bg-morandi-50'
                ]"
              >
                <div class="w-6 text-center">
                  <Music v-if="musicStore.currentTrack?.id === track.id" :size="14" class="text-teal-600" />
                  <span v-else class="text-sm text-morandi-500">{{ index + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-morandi-900 truncate text-sm">{{ track.name }}</p>
                  <p class="text-xs text-morandi-500 truncate">{{ track.artist }}</p>
                </div>
                <div class="text-xs text-morandi-500">
                  {{ musicStore.formatTime(track.duration) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 桌面端布局 - 切换为更稳健的 Flexbox 布局 -->
      <div class="hidden lg:flex gap-6 h-[calc(100vh-12rem)]">
        <!-- 左侧播放列表导航: 固定宽度，绝不压缩 -->
        <div class="w-72 flex-shrink-0">
          <div class="card h-full">
            <!-- 搜索框 -->
            <div class="mb-6">
              <input
                v-model="musicStore.searchQuery"
                placeholder="搜索音乐..."
                class="w-full px-4 py-2 rounded-lg border border-morandi-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent select-text"
              />
            </div>

            <!-- 播放列表 -->
            <div class="space-y-2">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-morandi-900">播放列表</h3>
                <button
                  @click="showCreatePlaylistDialog = true"
                  class="flex items-center gap-1 px-2 py-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-sm"
                  title="添加列表"
                >
                  <Plus :size="16" />
                  添加列表
                </button>
              </div>
              <div
                v-for="playlist in musicStore.playlists"
                :key="playlist.id"
                @click="selectPlaylist(playlist)"
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                  musicStore.currentPlaylist?.id === playlist.id 
                    ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                    : 'hover:bg-morandi-100'
                ]"
              >
                <DiscAlbum :size="20" class="text-blue-500" />
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ playlist.name }}</p>
                  <p class="text-sm text-morandi-500">
                    {{ getPlaylistDisplayCount(playlist) }} 首歌曲
                  </p>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="musicStore.playlists.length === 0" class="text-center py-8">
                <Music :size="32" class="mx-auto mb-3 text-morandi-400" />
                <p class="text-sm text-morandi-500">暂无播放列表</p>
                <p class="text-xs text-morandi-400 mt-1">请先在云盘中上传音乐文件</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间歌曲列表: 自动填充所有剩余空间 -->
        <div class="flex-1 min-w-0">
          <div class="card h-full flex flex-col">
            <!-- 列表头部 -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="font-bold text-morandi-900 lg:text-lg xl:text-xl">
                  {{ musicStore.currentPlaylist?.name || '选择播放列表' }}
                </h2>
                <p class="text-sm text-morandi-500">
                  {{ filteredTracks.length }} 首歌曲
                </p>
              </div>

              <!-- 列表操作 -->
              <div v-if="musicStore.currentPlaylist" class="flex items-center gap-2">
                <button
                  @click="playAll"
                  class="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                >
                  <Play :size="16" />
                  播放
                </button>
                
                <!-- 添加音乐按钮 -->
                <button
                  @click="showUploadMusicDialog = true"
                  class="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <Plus :size="16" />
                  添加
                </button>
                
                <!-- 右侧面板切换按钮 - 始终显示 -->
                <button
                  @click="showRightPanel = !showRightPanel"
                  :class="[
                    'flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors text-sm',
                    showRightPanel 
                      ? 'bg-teal-100 text-teal-700 hover:bg-teal-200' 
                      : 'bg-morandi-200 text-morandi-700 hover:bg-morandi-300'
                  ]"
                >
                  {{ showRightPanel ? '隐藏' : '详情' }}
                </button>
              </div>
            </div>

            <!-- 歌曲列表内容保持不变 -->
            <!-- 歌曲列表 -->
            <div class="flex-1 overflow-auto">
              <div v-if="filteredTracks.length > 0" class="space-y-1">
                <!-- 可拖动的歌曲列表 -->
                <draggable
                  v-if="!musicStore.searchQuery"
                  v-model="currentTracksList"
                  @end="onDragEnd"
                  item-key="id"
                  class="space-y-1"
                  :animation="150"
                  ghost-class="ghost"
                  chosen-class="chosen"
                  drag-class="drag"
                >
                  <template #item="{ element: track, index }">
                    <div
                      @click="playTrack(index)"
                      @dblclick="playTrackImmediately(index)"
                      :class="[
                        'flex items-center gap-4 p-3 rounded-lg cursor-move transition-all duration-200 group border-2',
                        musicStore.currentTrack?.id === track.id 
                          ? 'bg-teal-50 border-solid border-teal-500' 
                          : 'border-transparent hover:border-dashed hover:border-teal-300 hover:bg-morandi-50'
                      ]"
                    >
                      <!-- 拖动图标 -->
                      <div class="w-4 text-center opacity-30 group-hover:opacity-70 transition-opacity">
                        <div class="w-1 h-4 bg-morandi-400 rounded-full flex-shrink-0"></div>
                      </div>

                      <!-- 序号 / 播放状态 -->
                      <div class="w-8 text-center">
                        <span 
                          v-if="musicStore.currentTrack?.id !== track.id"
                          class="text-sm text-morandi-500"
                        >
                          {{ index + 1 }}
                        </span>
                        <Music 
                          v-else-if="musicStore.isPlaying"
                          :size="16" 
                          class="text-teal-600 animate-pulse" 
                        />
                        <Music 
                          v-else
                          :size="16" 
                          class="text-teal-600" 
                        />
                      </div>

                      <!-- 歌曲信息 -->
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-morandi-900 truncate">{{ track.name }}</p>
                        <p class="text-sm text-morandi-500 truncate">{{ track.artist }}</p>
                      </div>

                      <!-- 歌曲时长 -->
                      <div class="text-sm text-morandi-500">
                        {{ musicStore.formatTime(track.duration) }}
                      </div>
                    </div>
                  </template>
                </draggable>

                <!-- 搜索模式下的普通列表（不可拖动） -->
                <div v-else class="space-y-1">
                  <div
                    v-for="(track, index) in filteredTracks"
                    :key="track.id"
                    @click="playTrack(index)"
                    @dblclick="playTrackImmediately(index)"
                    :class="[
                      'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 group border-2',
                      musicStore.currentTrack?.id === track.id 
                        ? 'bg-teal-50 border-solid border-teal-500' 
                        : 'border-transparent hover:border-dashed hover:border-teal-300 hover:bg-morandi-50'
                    ]"
                  >
                    <!-- 序号 / 播放状态 -->
                    <div class="w-8 text-center">
                      <span 
                        v-if="musicStore.currentTrack?.id !== track.id"
                        class="text-sm text-morandi-500"
                      >
                        {{ index + 1 }}
                      </span>
                      <Music 
                        v-else-if="musicStore.isPlaying"
                        :size="16" 
                        class="text-teal-600 animate-pulse" 
                      />
                      <Music 
                        v-else
                        :size="16" 
                        class="text-teal-600" 
                      />
                    </div>

                    <!-- 歌曲信息 -->
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-morandi-900 truncate">{{ track.name }}</p>
                      <p class="text-sm text-morandi-500 truncate">{{ track.artist }}</p>
                    </div>

                    <!-- 歌曲时长 -->
                    <div class="text-sm text-morandi-500">
                      {{ musicStore.formatTime(track.duration) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <Music :size="48" class="mx-auto mb-4 text-morandi-400" />
                  <h3 class="text-lg font-medium text-morandi-700 mb-2">
                    {{ musicStore.searchQuery ? '未找到匹配的歌曲' : '播放列表为空' }}
                  </h3>
                  <p class="text-morandi-500">
                    {{ musicStore.searchQuery ? '尝试其他搜索词' : '请先选择一个播放列表' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧播放详情: 固定宽度，绝不压缩 -->
        <div v-if="showRightPanel" class="w-80 flex-shrink-0">
          <div class="card h-full flex flex-col">
            
            <!-- 专辑封面 -->
            <div class="text-center mb-6">
              <div class="w-32 h-32 lg:w-40 lg:h-40 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                <Music :size="48" class="text-white" />
              </div>
              <h3 class="font-bold text-morandi-900 truncate">{{ musicStore.currentTrackInfo.name }}</h3>
              <p class="text-sm text-morandi-600 truncate">{{ musicStore.currentTrackInfo.artist }}</p>
            </div>

            <!-- 播放进度 -->
            <div class="mb-6">
              <div class="flex items-center justify-between text-sm text-morandi-500 mb-2">
                <span>{{ musicStore.formatTime(musicStore.currentTime) }}</span>
                <span>{{ musicStore.formatTime(musicStore.duration) }}</span>
              </div>
              <div 
                class="w-full bg-morandi-200 rounded-full h-2 cursor-pointer"
                @click="seekToPosition"
              >
                <div 
                  class="bg-teal-500 h-2 rounded-full transition-all duration-100"
                  :style="{ width: progressPercentage + '%' }"
                ></div>
              </div>
            </div>

            <!-- 歌词区域 -->
            <div class="flex-1 overflow-auto">
              <div class="text-center">
                <h4 class="font-medium text-morandi-700 mb-3">歌词</h4>
                <div v-if="musicStore.currentTrackInfo.lyrics" class="text-sm text-morandi-600 leading-relaxed select-text">
                  {{ musicStore.currentTrackInfo.lyrics }}
                </div>
                <div v-else class="text-sm text-morandi-500">
                  暂无歌词
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建播放列表对话框 -->
    <div v-if="showCreatePlaylistDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">新建播放列表</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-morandi-700 mb-2">播放列表名称</label>
            <input
              v-model="newPlaylistName"
              type="text"
              placeholder="请输入播放列表名称"
              class="w-full px-4 py-2 border border-morandi-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 select-text"
              @keydown.enter="createNewPlaylist"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showCreatePlaylistDialog = false"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="createNewPlaylist"
            :disabled="!newPlaylistName.trim()"
            class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 上传音乐对话框 -->
    <div v-if="showUploadMusicDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">添加音乐</h3>
        <div class="space-y-4">
          <div class="border-2 border-dashed border-morandi-300 rounded-lg p-8 text-center">
            <Music :size="32" class="mx-auto mb-3 text-morandi-400" />
            <p class="text-morandi-600 mb-2">点击选择音乐文件或拖拽到此处</p>
            <p class="text-xs text-morandi-400">支持 MP3、WAV、FLAC、AAC、M4A、OGG 格式</p>
            <input 
              type="file" 
              multiple 
              accept="audio/*"
              class="hidden" 
              ref="musicFileInput"
              @change="handleMusicFileSelect"
            />
            <button 
              @click="() => musicFileInput?.click()"
              class="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              选择音乐文件
            </button>
          </div>
          
          <!-- 音乐文件列表 -->
          <div v-if="selectedMusicFiles.length > 0" class="max-h-32 overflow-auto">
            <h4 class="text-sm font-medium text-morandi-700 mb-2">待添加音乐：</h4>
            <div class="space-y-1">
              <div 
                v-for="(file, index) in selectedMusicFiles" 
                :key="index"
                class="flex items-center justify-between text-xs bg-morandi-50 p-2 rounded"
              >
                <span class="truncate flex-1">{{ file.name }}</span>
                <span class="text-morandi-500 ml-2">{{ (file.size / (1024 * 1024)).toFixed(1) }}MB</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showUploadMusicDialog = false; selectedMusicFiles = []"
            class="px-4 py-2 text-morandi-600 hover:bg-morandi-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="uploadMusicFiles"
            :disabled="selectedMusicFiles.length === 0"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加 ({{ selectedMusicFiles.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Music, DiscAlbum, Play, Upload, Plus } from 'lucide-vue-next'
import { useMusicStore, Playlist, Track } from '../store/MusicStore'
import { useDriveStore } from '../store/DriveStore'
import { useTransferStore } from '../store/TransferStore'
import { useToast } from 'vue-toastification'
import draggable from 'vuedraggable'
import type { Track as TrackType } from '../store/MusicStore'
import { useRoute } from 'vue-router'

const musicStore = useMusicStore()
const driveStore = useDriveStore()
const transferStore = useTransferStore()
const toast = useToast()
const route = useRoute()

// 响应式状态
const showRightPanel = ref(true)
const showCreatePlaylistDialog = ref(false)
const showUploadMusicDialog = ref(false)
const newPlaylistName = ref('')
const selectedMusicFiles = ref<File[]>([])
const musicFileInput = ref<HTMLInputElement | null>(null)

// 计算属性
const filteredTracks = computed(() => {
  return musicStore.filteredTracks
})

// 可拖动的歌曲列表
const currentTracksList = computed({
  get: () => musicStore.currentPlaylist?.tracks || [],
  set: (value: TrackType[]) => {
    if (musicStore.currentPlaylist) {
      musicStore.currentPlaylist.tracks = value
    }
  }
})

// 拖动结束事件
const onDragEnd = (event: {oldIndex: number, newIndex: number}) => {
  if (event.oldIndex !== event.newIndex) {
    musicStore.reorderTracks(event.oldIndex, event.newIndex)
  }
}

const progressPercentage = computed(() => {
  if (musicStore.duration === 0) return 0
  return (musicStore.currentTime / musicStore.duration) * 100
})

// 方法
const selectPlaylist = (playlist: any) => {
  musicStore.setCurrentPlaylist(playlist)
}

const playTrack = (index: number) => {
  musicStore.setCurrentTrack(index)
}

const playTrackImmediately = (index: number) => {
  musicStore.setCurrentTrack(index)
  musicStore.play()
}

const playAll = () => {
  if (filteredTracks.value.length > 0) {
    musicStore.setCurrentTrack(0)
    musicStore.play()
  }
}



const seekToPosition = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percentage = (event.clientX - rect.left) / rect.width
  const newTime = percentage * musicStore.duration
  musicStore.seek(newTime)
}

const getPlaylistDisplayCount = (playlist: any) => {
  // 如果没有搜索条件，显示总数
  if (!musicStore.searchQuery) {
    return playlist.tracks.length
  }
  
  // 如果有搜索条件，显示该播放列表中匹配的数量
  return playlist.tracks.filter((track: any) => 
    track.name.toLowerCase().includes(musicStore.searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(musicStore.searchQuery.toLowerCase())
  ).length
}

// 加载云盘音乐数据
const loadMusicFromDrive = () => {
  // 从 DriveStore 中获取数据，这样音乐页面和网盘页面就使用同一套数据了
  musicStore.loadPlaylistsFromDrive()
}

onMounted(() => {
  loadMusicFromDrive()
  const { playlist, song } = route.query
  if (playlist && song && typeof playlist === 'string' && typeof song === 'string') {
    musicStore.playSongFromDrive(playlist, song)
  }
})

// 组件卸载时清理定时器
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    musicStore.cleanup()
  })
}

// 新建播放列表的方法
const createNewPlaylist = () => {
  const playlistName = newPlaylistName.value.trim()
  if (!playlistName) return

  // 这里调用创建播放列表的逻辑，相当于在云盘音乐目录下创建文件夹
  // 实际实现需要与DriveStore配合
  console.log('创建新播放列表:', playlistName)
  
  showCreatePlaylistDialog.value = false
  newPlaylistName.value = ''
}

// 上传音乐文件的方法
const uploadMusicFiles = async () => {
  if (selectedMusicFiles.value.length === 0) return
  
  // 获取当前播放列表的路径，如果没有则上传到音乐根目录
  const currentPlaylist = musicStore.currentPlaylist
  const targetPath = currentPlaylist ? `/音乐/${currentPlaylist.name}` : '/音乐'
  
  // 使用 TransferStore 处理上传
  await transferStore.uploadFiles(selectedMusicFiles.value, targetPath)
  
  showUploadMusicDialog.value = false
  selectedMusicFiles.value = []
  toast.success(`已开始上传 ${selectedMusicFiles.value.length} 个音乐文件`)
}

// 处理音乐文件选择
const handleMusicFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || []).filter(file => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    return ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(ext || '')
  })
  selectedMusicFiles.value = files
}
</script>

<style scoped>
/* 拖动状态的样式 */
.ghost {
  opacity: 0.5;
  background: #c8f5e9;
  border: 2px dashed #14b8a6;
}

.chosen {
  opacity: 0.8;
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.drag {
  opacity: 0.8;
  transform: rotate(2deg);
}

/* 拖动过渡动画 */
.flip-list-move {
  transition: transform 0.3s;
}
</style> 